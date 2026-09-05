<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import FileDropZone from './FileDropZone.svelte';
  import FileTree from './FileTree.svelte';
  import FileList from './FileList.svelte';
  import DownloadAllButton from './DownloadAllButton.svelte';
  import { buildFileTree } from '../../lib/file-utils';
  import { downloadUrl } from '../../lib/download';
  import type { FileEntry, FileTreeNode } from '../../lib/file-utils';

  let files: FileEntry[] = [];
  let fileTree: FileTreeNode[] = [];
  let selectedFileIndex: number | null = null;
  let isExtracting = false;
  let extractProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: 0 };
  let toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }> = [];
  let showHiddenFiles = false;
  let worker: Worker | null = null;

  let toastId = 0;

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++toastId;
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => dismissToast(id), 5000);
  }

  function dismissToast(id: number) {
    toasts = toasts.filter(t => t.id !== id);
  }

  function getTypeClass(type: string): string {
    switch (type) {
      case 'success': return 'border-l-4 border-green-500 bg-green-50 text-green-900';
      case 'error': return 'border-l-4 border-red-500 bg-red-50 text-red-900';
      default: return 'border-l-4 border-blue-500 bg-blue-50 text-blue-900';
    }
  }

  function initWorker() {
    if (worker) return;
    worker = new Worker(new URL('../../workers/extract.worker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (event) => {
      const { type, ...data } = event.data;
      
      switch (type) {
        case 'progress':
          extractProgress = data;
          break;
        case 'complete':
          files = data.files;
          fileTree = buildFileTree(data.files);
          isExtracting = false;
          showToast(`Extracted ${data.files.length} files (${formatFileSize(data.totalSize)})`, 'success');
          break;
        case 'fileContent':
          handleFileContent(data);
          break;
        case 'downloadReady':
          downloadUrl(data.url, data.filename);
          showToast('Download started', 'success');
          break;
        case 'error':
          isExtracting = false;
          showToast(data.message, 'error');
          break;
      }
    };
  }

  async function handleExtract(file: File) {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      showToast('Please select a ZIP file', 'error');
      return;
    }

    initWorker();
    isExtracting = true;
    extractProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: 0 };
    files = [];
    fileTree = [];
    selectedFileIndex = null;
    
    worker!.postMessage({ type: 'extract', data: { file } });
  }

  function handleFileContent(data: any) {
    const event = new CustomEvent('file-content', { 
      detail: { 
        fileIndex: data.fileIndex, 
        content: data.content, 
        mimeType: data.mimeType, 
        filename: data.filename 
      } 
    });
    window.dispatchEvent(event);
  }

  function handleFileSelect(index: number) {
    selectedFileIndex = index;
    
    if (worker) {
      worker.postMessage({ type: 'getContent', data: { fileIndex: index } });
    }
  }

  function handleFileDownload(index: number) {
    if (worker) {
      worker.postMessage({ type: 'getContent', data: { fileIndex: index } });
    }
  }

  onMount(() => {
    const handleContentRequest = (event: Event) => {
      handleFileSelect((event as CustomEvent).detail.fileIndex);
    };
    const handleDownloadRequest = (event: Event) => {
      handleFileDownload((event as CustomEvent).detail.fileIndex);
    };
    window.addEventListener('request-file-content', handleContentRequest);
    window.addEventListener('request-download', handleDownloadRequest);
    return () => {
      window.removeEventListener('request-file-content', handleContentRequest);
      window.removeEventListener('request-download', handleDownloadRequest);
    };
  });

  function handleToggleHidden(value: boolean) {
    showHiddenFiles = value;
  }

  function handleDownloadAll() {
    if (!worker || files.length === 0) return;
    
    const fileIndices = files.map((_, i) => i);
    worker.postMessage({ type: 'downloadAll', data: { fileIndices } });
  }

  function handleClear() {
    if (worker) {
      worker.postMessage({ type: 'close' });
      worker.terminate();
      worker = null;
    }
    files = [];
    fileTree = [];
    selectedFileIndex = null;
    isExtracting = false;
    extractProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: 0 };
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  const extractContext = {
    get files() { return files; },
    get fileTree() { return fileTree; },
    get selectedFileIndex() { return selectedFileIndex; },
    get isExtracting() { return isExtracting; },
    get extractProgress() { return extractProgress; },
    get showHiddenFiles() { return showHiddenFiles; },
    set showHiddenFiles(value: boolean) { showHiddenFiles = value; },
    handleFileSelect,
    handleFileDownload,
    handleDownloadAll,
    handleClear,
  };

  setContext('extract', extractContext);
</script>

<svelte:head>
  <title>Extract ZIP - Unzip Files Online</title>
</svelte:head>

<div class="w-full max-w-7xl mx-auto space-y-8">
  <header class="gradient-mesh relative overflow-hidden rounded-lg border border-hairline px-6 py-10 sm:px-12 sm:py-16">
    <div class="relative max-w-2xl space-y-4">
      <p class="text-mono-eyebrow font-mono text-cyan uppercase tracking-[0.18em]">Private file utility / 01</p>
      <h1 class="text-display-xl font-semibold text-ink tracking-tight sm:text-[56px] sm:leading-[1.02]">Unpack without leaving a trace.</h1>
      <p class="text-body-lg text-body max-w-xl">Drop a ZIP and turn it into something usable. Everything stays in this browser, with a quiet interface that gets out of your way.</p>
    </div>
  </header>

  <FileDropZone on:extract={handleExtract} {isExtracting} />

  {#if isExtracting}
    <div class="card p-4 animate-slide-in" role="progressbar" aria-valuenow={extractProgress.total > 0 ? Math.round((extractProgress.loaded / extractProgress.total) * 100) : 0} aria-valuemin="0" aria-valuemax="100" aria-label="Extraction progress">
      <div class="flex items-center justify-between gap-4 mb-2">
        <span class="text-body-md text-ink font-medium">Extracting...</span>
        <span class="text-body-sm text-mute font-mono">{extractProgress.fileIndex} / {extractProgress.totalFiles}</span>
      </div>
      <div class="w-full h-2 bg-hairline-soft rounded-full overflow-hidden">
        <div 
          class="h-full bg-ink transition-all duration-fast ease-out" 
          style="width: {extractProgress.total > 0 ? (extractProgress.loaded / extractProgress.total) * 100 : 0}%"
        ></div>
      </div>
      <p class="text-body-sm text-mute mt-2 truncate">{extractProgress.currentFile}</p>
    </div>
  {/if}

  {#if files.length > 0}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <aside class="lg:col-span-1" aria-label="File structure">
        <FileTree 
          tree={fileTree} 
          selectedIndex={selectedFileIndex}
          onselect={handleFileSelect}
          showHiddenFiles={showHiddenFiles}
          onToggleHidden={handleToggleHidden}
        />
      </aside>

      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-heading-md font-semibold text-ink">{files.length} files</h2>
          <DownloadAllButton onClick={handleDownloadAll} disabled={files.length === 0} />
        </div>
        <FileList 
          files={files} 
          selectedIndex={selectedFileIndex}
          onSelect={handleFileSelect}
          showHiddenFiles={showHiddenFiles}
        />
      </div>
    </div>
  {/if}

  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    {#each toasts as toast}
      <div 
        class="flex items-start gap-3 px-4 py-3 rounded-md shadow-floating min-w-[300px] max-w-md pointer-events-auto animate-slide-in {getTypeClass(toast.type)}"
        role="alert"
        aria-live="polite"
      >
        <span class="flex-1 text-body-md">{toast.message}</span>
        <button
          class="p-1 rounded-sm hover:bg-black/10 transition-colors text-current opacity-60 hover:opacity-100"
          on:click={() => dismissToast(toast.id)}
          aria-label="Dismiss"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  :global(.file-tree-item) {
    @apply relative pl-6 border-l border-hairline;
  }
  
  :global(.file-tree-item:last-child) {
    @apply border-l-hairline;
  }
  
  :global(.file-tree-item::before) {
    content: '';
    @apply absolute left-[-1px] top-0 h-6 w-1 border-t border-hairline;
  }
  
  :global(.file-tree-item:last-child::before) {
    @apply h-full;
  }
</style>