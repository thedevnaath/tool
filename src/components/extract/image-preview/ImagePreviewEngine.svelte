<script lang="ts">
  import { createEventDispatcher } from 'svelte';
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

  function onRename(event: CustomEvent<string>) {
    dispatch('rename', event.detail);
    viewMode = 'preview';
  }
</script>

<div 
  class="flex flex-col border-t border-hairline animate-expand-down bg-canvas" 
  bind:this={containerRef}
>
  <ImageToolbar 
    bind:viewMode
    setViewMode={(m) => viewMode = m}
    onZoomIn={handleZoomIn}
    onZoomOut={handleZoomOut}
    onFit={handleFit}
    onActualSize={handleActualSize}
    onFullscreen={handleFullscreen}
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
