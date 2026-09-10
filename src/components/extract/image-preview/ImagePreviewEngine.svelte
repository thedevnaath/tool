<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { FileEntry } from '../../../lib/file-utils';
  import ImageToolbar from './ImageToolbar.svelte';
  import NativeImageViewer from './NativeImageViewer.svelte';
  import PsdImageViewer from './PsdImageViewer.svelte';
  import MetadataView from './MetadataView.svelte';
  import RenameView from './RenameView.svelte';
  import type { TransformState } from './gestures';

  export let file: FileEntry;
  export let previewObjectUrl: string | null = null;
  export let content: ArrayBuffer | null = null;
  export let mimeType: string = '';

  const dispatch = createEventDispatcher();

  let viewMode: 'preview' | 'metadata' | 'rename' = 'preview';
  
  let transform: TransformState = { x: 0, y: 0, scale: 1 };
  
  let viewerComponent: any;
  let containerRef: HTMLDivElement;
  let isFullscreen = false;

  function onFullscreenChange() {
    isFullscreen = !!document.fullscreenElement;
    if (isFullscreen) {
      setTimeout(handleFit, 50);
    }
  }

  onMount(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange);
  });

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
  });

  $: ext = (file.filename.split('.').pop() ?? '').toLowerCase();
  $: isPsd = ext === 'psd';
  $: isNative = !isPsd && !!previewObjectUrl;

  function handleTransform(t: TransformState) {
    transform = t;
  }

  function handleZoomIn() {
    transform = { ...transform, scale: Math.min(transform.scale * 1.5, 50) };
  }

  function handleZoomOut() {
    transform = { ...transform, scale: Math.max(transform.scale / 1.5, 0.1) };
  }

  function handleFit() {
    if (viewerComponent && typeof viewerComponent.fitToScreen === 'function') {
      viewerComponent.fitToScreen();
    }
  }

  function handleActualSize() {
    if (viewerComponent && typeof viewerComponent.actualSize === 'function') {
      viewerComponent.actualSize();
    } else {
      transform = { x: 0, y: 0, scale: 1 };
    }
  }

  function handleFullscreen() {
    if (containerRef) {
      if (!document.fullscreenElement) {
        containerRef.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    }
  }

  async function handleCopy() {
    try {
      if (isNative && previewObjectUrl) {
        const response = await fetch(previewObjectUrl);
        const blob = await response.blob();
        try {
          await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        } catch (err) {
          // Fallback for unsupported types: draw to canvas and copy as png
          const img = new Image();
          img.src = previewObjectUrl;
          await new Promise((resolve) => { img.onload = resolve; });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob(async (pngBlob) => {
            if (pngBlob) {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
            }
          }, 'image/png');
        }
      } else if (isPsd && viewerComponent && typeof viewerComponent.getCanvas === 'function') {
        const canvas = viewerComponent.getCanvas();
        if (canvas) {
          canvas.toBlob(async (blob) => {
            if (blob) {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            }
          }, 'image/png');
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  function onRename(event: CustomEvent<string>) {
    dispatch('rename', event.detail);
    viewMode = 'preview';
  }
</script>

<div 
  class="flex flex-col bg-canvas cursor-auto {isFullscreen ? 'w-full h-full' : 'border-t border-hairline animate-expand-down h-[70vh] min-h-[400px]'}" 
  bind:this={containerRef}
  on:click|stopPropagation
  on:keydown|stopPropagation
>
  <ImageToolbar 
    bind:viewMode
    setViewMode={(m) => viewMode = m}
    onZoomIn={handleZoomIn}
    onZoomOut={handleZoomOut}
    onFit={handleFit}
    onActualSize={handleActualSize}
    onFullscreen={handleFullscreen}
    onCopy={handleCopy}
  />
  
  {#if viewMode === 'preview'}
    {#if isPsd && content}
      <PsdImageViewer {content} alt={file.filename} {transform} onTransform={handleTransform} bind:this={viewerComponent} />
    {:else if isNative && previewObjectUrl}
      <NativeImageViewer src={previewObjectUrl} alt={file.filename} {transform} onTransform={handleTransform} bind:this={viewerComponent} />
    {:else}
      <div class="flex items-center justify-center h-[300px] text-faint">
        Preview not available for this format.
      </div>
    {/if}
  {:else if viewMode === 'metadata'}
    <MetadataView {file} {mimeType} />
  {:else if viewMode === 'rename'}
    <RenameView {file} onCancel={() => viewMode = 'preview'} on:rename={onRename} />
  {/if}
</div>
