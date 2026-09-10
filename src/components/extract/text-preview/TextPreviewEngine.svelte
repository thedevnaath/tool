<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { FileEntry } from '../../../lib/file-utils';
  import TextToolbar from './TextToolbar.svelte';
  import PlainTextViewer from './PlainTextViewer.svelte';
  import CodeViewer from './CodeViewer.svelte';
  import MarkdownViewer from './MarkdownViewer.svelte';
  import HtmlViewer from './HtmlViewer.svelte';
  import MetadataView from '../image-preview/MetadataView.svelte';
  import RenameView from '../image-preview/RenameView.svelte';

  export let file: FileEntry;
  export let content: string;
  export let mimeType: string = '';

  const dispatch = createEventDispatcher();

  $: ext = (file.filename.split('.').pop() ?? '').toLowerCase();

  // Determine capabilities based on extension
  $: isMarkdown = ext === 'md' || ext === 'markdown';
  $: isHtml = ext === 'html' || ext === 'htm';
  $: showPreview = isMarkdown || isHtml;
  
  // By default, open in preview if available, otherwise source.
  let viewMode: 'preview' | 'source' | 'metadata' | 'rename' = 'source';
  $: {
    if (showPreview && viewMode === 'source' && !mounted) {
      viewMode = 'preview';
    }
  }

  let mounted = false;
  let isWrapped = false;
  let containerRef: HTMLDivElement;
  let isFullscreen = false;

  function onFullscreenChange() {
    isFullscreen = !!document.fullscreenElement;
  }

  onMount(() => {
    mounted = true;
    if (showPreview) {
      viewMode = 'preview';
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
  });

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
  });

  function handleToggleWrap() {
    isWrapped = !isWrapped;
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
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  function onRename(event: CustomEvent<string>) {
    dispatch('rename', event.detail);
    viewMode = showPreview ? 'preview' : 'source';
  }

  // Common plain text formats that don't need syntax highlighting
  const plainTextExtensions = ['txt', 'log', 'ini', 'cfg', 'conf', 'env', 'csv', 'tsv'];
  $: isPlainText = plainTextExtensions.includes(ext);
</script>

<div 
  class="flex flex-col bg-canvas cursor-auto {isFullscreen ? 'w-full h-full' : 'border-t border-hairline animate-expand-down h-[70vh] min-h-[400px]'}" 
  bind:this={containerRef}
  on:click|stopPropagation
  on:keydown|stopPropagation
>
  <TextToolbar 
    bind:viewMode
    {showPreview}
    {isWrapped}
    setViewMode={(m) => viewMode = m}
    onToggleWrap={handleToggleWrap}
    onFullscreen={handleFullscreen}
    onCopy={handleCopy}
  />
  
  {#if viewMode === 'preview' && showPreview}
    {#if isMarkdown}
      <MarkdownViewer {content} />
    {:else if isHtml}
      <HtmlViewer {content} />
    {/if}
  {:else if viewMode === 'source'}
    {#if isPlainText}
      <PlainTextViewer {content} {isWrapped} />
    {:else}
      <CodeViewer {content} extension={ext} {isWrapped} />
    {/if}
  {:else if viewMode === 'metadata'}
    <MetadataView {file} {mimeType} />
  {:else if viewMode === 'rename'}
    <RenameView {file} onCancel={() => viewMode = showPreview ? 'preview' : 'source'} on:rename={onRename} />
  {/if}
</div>
