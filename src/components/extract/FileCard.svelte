<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { FileEntry } from '../../lib/file-utils';
  import ImagePreviewEngine from './image-preview/ImagePreviewEngine.svelte';
  import TextPreviewEngine from './text-preview/TextPreviewEngine.svelte';

  export let file: FileEntry;
  export let index: number;
  export let isSelected: boolean = false;
  export let onSelect: (index: number) => void = () => {};

  const MAX_TEXT_PREVIEW_BYTES = 1024 * 256;

  let isExpanded = false;
  let previewContent: string | null = null;
  let previewObjectUrl: string | null = null;
  let rawContent: ArrayBuffer | null = null;
  let previewMimeType: string = '';
  let previewLoading = false;

  $: ext = (file.filename.split('.').pop() ?? '').toLowerCase();
  $: basename = file.filename.split('/').pop() || file.filename;
  $: dirname = file.filename.includes('/') ? file.filename.split('/').slice(0, -1).join('/') + '/' : '';
  $: mimeType = file.mimeType || '';
  $: isPsdFile = ext === 'psd';
  $: isImageFile = IMAGE_EXTS.includes(ext) || mimeType.startsWith('image/') || isPsdFile;
  $: isTextFile = ['text/', 'application/json', 'application/xml', 'application/javascript', 'application/typescript'].some(t => mimeType.startsWith(t));
  $: isPreviewable = (isImageFile || isTextFile) && file.uncompressedSize < 50 * 1024 * 1024; // Increased to 50MB to support larger PSDs

  const IMAGE_EXTS = ['jpg','jpeg','png','gif','svg','webp','ico','bmp','avif','apng'];
  const VIDEO_EXTS = ['mp4','mov','avi','webm','mkv'];
  const CODE_EXTS = ['js','ts','jsx','tsx','py','rb','go','rs','java','php','sh','swift','kt','dart'];
  const DATA_EXTS = ['json','yaml','yml','toml','csv','sql','graphql'];
  const DOC_EXTS = ['md','txt','rst'];

  function iconColor(e: string): string {
    if (IMAGE_EXTS.includes(e)) return 'text-violet';
    if (VIDEO_EXTS.includes(e)) return 'text-pink';
    if (CODE_EXTS.includes(e)) return 'text-cyan';
    if (DATA_EXTS.includes(e)) return 'text-success';
    if (DOC_EXTS.includes(e)) return 'text-link';
    if (e === 'zip' || e === 'gz' || e === 'tar') return 'text-error';
    return 'text-faint';
  }
  function iconBg(e: string): string {
    if (IMAGE_EXTS.includes(e)) return 'bg-violet-soft';
    if (VIDEO_EXTS.includes(e)) return 'bg-error-soft';
    if (CODE_EXTS.includes(e)) return 'bg-cyan-soft';
    if (DATA_EXTS.includes(e)) return 'bg-success-soft';
    return 'bg-hairline-soft';
  }

  function formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }

  function handleDownload() {
    window.dispatchEvent(new CustomEvent('request-download', { detail: { fileIndex: index } }));
  }

  function handleRename(event: CustomEvent<string>) {
    window.dispatchEvent(new CustomEvent('rename-file', { detail: { fileIndex: index, newName: event.detail } }));
  }

  async function toggleExpand() {
    isExpanded = !isExpanded;
    if (isExpanded && isPreviewable && previewContent === null && previewObjectUrl === null) {
      previewLoading = true;
      onSelect(index);
    }
  }

  function handleFileContent(e: Event) {
    const detail = (e as CustomEvent).detail;
    if (detail.fileIndex !== index) return;
    previewMimeType = detail.mimeType || '';
    previewLoading = false;
    if (detail.content instanceof ArrayBuffer) {
      rawContent = detail.content;
      if (isImageFile) {
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        if (!isPsdFile) {
          const blob = new Blob([detail.content], { type: previewMimeType || 'image/png' });
          previewObjectUrl = URL.createObjectURL(blob);
        }
        previewContent = 'image_loaded'; // non-null to indicate loaded
      } else {
        const bytes = new Uint8Array(detail.content);
        previewContent = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, MAX_TEXT_PREVIEW_BYTES));
      }
    } else if (typeof detail.content === 'string') {
      previewContent = detail.content;
    }
  }

  onMount(() => { window.addEventListener('file-content', handleFileContent); });
  onDestroy(() => {
    window.removeEventListener('file-content', handleFileContent);
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
  });
</script>

<div
  class="group card overflow-hidden transition-all duration-fast cursor-pointer
    {isSelected ? 'border-link/40 shadow-glow' : 'hover:border-hairline/80'}"
  role="listitem"
  on:click={toggleExpand}
  on:keydown={(e) => e.key === 'Enter' && toggleExpand()}
>
  <!-- Header row -->
  <div class="flex items-center gap-3 px-4 py-3">
    <!-- File type icon -->
    <div class="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg {iconBg(ext)}">
      {#if IMAGE_EXTS.includes(ext)}
        <svg class="w-4 h-4 {iconColor(ext)}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      {:else if VIDEO_EXTS.includes(ext)}
        <svg class="w-4 h-4 {iconColor(ext)}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      {:else}
        <svg class="w-4 h-4 {iconColor(ext)}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      {/if}
    </div>

    <!-- Filename + path -->
    <div class="flex-1 min-w-0">
      <p class="text-body-md font-medium text-ink truncate leading-tight">{basename}</p>
      {#if dirname}
        <p class="text-body-sm text-faint font-mono truncate mt-0.5">{dirname}</p>
      {/if}
    </div>

    <!-- Right: meta + actions -->
    <div class="flex-shrink-0 flex items-center gap-2">
      <span class="font-mono text-body-sm text-mute hidden sm:block">{formatSize(file.uncompressedSize)}</span>
      {#if ext}
        <span class="badge-default hidden md:inline-flex uppercase font-mono">.{ext}</span>
      {/if}
      <button
        class="btn-square"
        on:click|stopPropagation={handleDownload}
        aria-label="Download {basename}"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span class="hidden sm:inline">Download</span>
      </button>
      <button
        class="btn-icon ml-1"
        on:click|stopPropagation={toggleExpand}
        aria-label={isExpanded ? 'Collapse preview' : 'Expand preview'}
        aria-expanded={isExpanded}
      >
        <svg class="w-3.5 h-3.5 transition-transform duration-fast {isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Preview -->
  {#if isExpanded}
    <div class="border-t border-hairline animate-expand-down">
      {#if previewLoading}
        <div class="flex items-center justify-center py-10">
          <div class="w-5 h-5 border-2 border-hairline border-t-ink rounded-full animate-spin" aria-hidden="true"></div>
        </div>
      {:else if previewContent !== null}
        {#if isImageFile}
          <ImagePreviewEngine 
            {file} 
            {previewObjectUrl} 
            content={rawContent}
            mimeType={previewMimeType} 
            on:rename={handleRename}
          />
        {:else}
          <TextPreviewEngine 
            {file} 
            content={previewContent + (file.uncompressedSize > MAX_TEXT_PREVIEW_BYTES ? '\n\n... (truncated — file too large to fully preview)' : '')}
            mimeType={previewMimeType}
            on:rename={handleRename}
          />
        {/if}
      {:else}
        <div class="flex items-center justify-center py-8 text-faint text-body-sm">
          {isPreviewable ? 'Preview loading...' : 'Preview not available for this file format.'}
        </div>
      {/if}
    </div>
  {/if}
</div>
