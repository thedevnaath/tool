<script lang="ts">
  import { 
    File, Image, Video, Music, FileText, Code, Download, 
    ChevronDown, ChevronUp, X, ExternalLink, Eye, EyeOff 
  } from 'lucide-svelte';
  import type { FileEntry } from '../../lib/file-utils';
  import { getFileType, getMimeType, canPreview, formatFileSize, formatDate } from '../../lib/file-utils';
  import { downloadUrl, downloadDataUrl, downloadText, downloadArrayBuffer } from '../../lib/download';
  import FilePreview from './FilePreview.svelte';

  export let file: FileEntry;
  export let index: number;
  export let isSelected: boolean = false;
  export let onSelect: (index: number) => void = () => {};

  let isExpanded = false;
  let previewContent: string | ArrayBuffer | null = null;
  let previewMimeType = '';
  let previewError: string | null = null;
  let isLoadingPreview = false;
  let downloadAfterLoad = false;

  const fileType = getFileType(file.filename);
  const mimeType = getMimeType(file.filename);
  const previewable = canPreview(file.filename);

  function getFileIcon() {
    switch (fileType) {
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Music;
      case 'pdf': return FileText;
      case 'code': return Code;
      case 'text': return FileText;
      default: return File;
    }
  }

  function handleClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('button')) return;
    onSelect(index);
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
    if (isExpanded && previewable && !previewContent) {
      loadPreview();
    }
  }

  async function loadPreview() {
    isLoadingPreview = true;
    previewError = null;
    
    const handleContent = (event: CustomEvent) => {
      const { fileIndex, content, mimeType: mt, filename } = event.detail;
      if (fileIndex === index) {
        previewContent = content;
        previewMimeType = mt;
        isLoadingPreview = false;
        if (downloadAfterLoad) {
          downloadAfterLoad = false;
          downloadContent(content, mt);
        }
        window.removeEventListener('file-content', handleContent as EventListener);
      }
    };
    
    window.addEventListener('file-content', handleContent as EventListener);
    window.dispatchEvent(new CustomEvent('request-file-content', { detail: { fileIndex: index } }));
    
    setTimeout(() => {
      if (isLoadingPreview) {
        isLoadingPreview = false;
        previewError = 'Preview timed out';
        window.removeEventListener('file-content', handleContent as EventListener);
      }
    }, 10000);
  }

  function handleDownload() {
    if (previewContent) {
      downloadContent(previewContent, previewMimeType || mimeType);
    } else {
      downloadAfterLoad = true;
      window.dispatchEvent(new CustomEvent('request-download', { detail: { fileIndex: index } }));
    }
  }

  function downloadContent(content: string | ArrayBuffer, contentMimeType: string) {
    if (typeof content === 'string') {
      if (content.startsWith('data:')) {
        downloadDataUrl(content, file.filename);
      } else {
        downloadText(content, file.filename);
      }
    } else {
      downloadArrayBuffer(content, file.filename, contentMimeType);
    }
  }
</script>

<div 
  class="card overflow-hidden transition-all duration-fast
    {isSelected ? 'border-link shadow-whisper' : 'border-hairline hover:border-mute'}"
  on:click={handleClick}
  role="listitem"
>
  <div class="p-4 flex items-center gap-3">
    <div class="flex items-center justify-center w-10 h-10 rounded-md bg-hairline-soft text-ink flex-shrink-0">
      <svelte:component this={getFileIcon()} class="w-5 h-5" aria-hidden="true" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <h4 class="text-body-md font-medium text-ink truncate">{file.filename}</h4>
        {#if file.isDirectory}
          <span class="px-2 py-0.5 text-body-sm bg-hairline-soft text-mute rounded-sm">Folder</span>
        {/if}
      </div>
      <div class="flex items-center gap-3 text-body-sm text-mute mt-0.5">
        <span class="font-mono">{formatFileSize(file.uncompressedSize)}</span>
        <span>{formatDate(file.lastModDate)}</span>
        {#if file.compressedSize > 0 && file.uncompressedSize > 0}
          <span class="text-green-600">
            {Math.round((1 - file.compressedSize / file.uncompressedSize) * 100)}% saved
          </span>
        {/if}
      </div>
    </div>

    <div class="flex items-center gap-1">
      {#if previewable}
        <button
          class="btn-icon p-1.5"
          on:click={(e) => { e.stopPropagation(); toggleExpanded(); }}
          aria-label={isExpanded ? 'Collapse preview' : 'Expand preview'}
          aria-expanded={isExpanded}
        >
          {#if isExpanded}
            <ChevronUp class="w-4 h-4" aria-hidden="true" />
          {:else}
            <ChevronDown class="w-4 h-4" aria-hidden="true" />
          {/if}
        </button>
      {/if}
      
      <button
        class="btn-icon p-1.5"
        on:click={(e) => { e.stopPropagation(); handleDownload(); }}
        aria-label="Download {file.filename}"
      >
        <Download class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </div>

  {#if isExpanded}
    <div class="border-t border-hairline bg-hairline-soft animate-expand" role="region" aria-label="File preview">
      <div class="p-4">
        {#if isLoadingPreview}
          <div class="flex items-center justify-center py-8">
            <div class="w-8 h-8 border-2 border-hairline border-t-ink rounded-full animate-spin" aria-hidden="true"></div>
            <span class="ml-3 text-body-md text-body">Loading preview...</span>
          </div>
        {:else if previewError}
          <div class="flex flex-col items-center gap-3 py-8 text-center">
            <X class="w-12 h-12 text-error" aria-hidden="true" />
            <p class="text-body-md text-body">{previewError}</p>
            <button class="btn-secondary" on:click={loadPreview}>Retry</button>
          </div>
        {:else if previewContent}
          <FilePreview
            content={previewContent}
            mimeType={previewMimeType}
            filename={file.filename}
            fileType={fileType}
          />
        {:else if previewable}
          <button class="btn-secondary w-full" on:click={loadPreview}>
            Load Preview
          </button>
        {:else}
          <div class="flex flex-col items-center gap-3 py-8 text-center text-mute">
            <File class="w-12 h-12 opacity-50" aria-hidden="true" />
            <p class="text-body-md">Preview not available for this file type</p>
            <button class="btn-secondary" on:click={handleDownload}>
              Download to view
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>