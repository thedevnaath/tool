<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import FileCollector from './FileCollector.svelte';
  import ArchiveConfig from './ArchiveConfig.svelte';
  import CreateProgress from './CreateProgress.svelte';
  import { downloadUrl } from '../../lib/download';

  let files: File[] = [];
  let archiveName = 'archive.zip';
  let compressionLevel = 6;
  let isCreating = false;
  let createProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: 0 };
  let toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }> = [];
  let worker: Worker | null = null;
  let downloadUrl_: string | null = null;

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
    worker = new Worker(new URL('../../workers/create.worker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (event) => {
      const { type, ...data } = event.data;
      
      switch (type) {
        case 'progress':
          createProgress = data;
          break;
        case 'complete':
          isCreating = false;
          downloadUrl_ = data.url;
          showToast(`Created ${data.filename} (${formatFileSize(data.totalSize)} → ${formatFileSize(data.compressedSize)})`, 'success');
          downloadUrl(data.url, data.filename);
          break;
        case 'error':
          isCreating = false;
          showToast(data.message, 'error');
          break;
      }
    };
  }

  function handleAddFiles(newFiles: File[]) {
    files = [...files, ...newFiles];
    if (worker) {
      worker.postMessage({ type: 'addFiles', data: { files } });
    }
  }

  function handleRemoveFile(index: number) {
    files = files.filter((_, i) => i !== index);
    if (worker) {
      worker.postMessage({ type: 'addFiles', data: { files } });
    }
  }

  function handleClearAll() {
    files = [];
    if (worker) {
      worker.postMessage({ type: 'clear' });
    }
  }

  async function handleCreate() {
    if (files.length === 0) {
      showToast('Add files first', 'error');
      return;
    }

    initWorker();
    isCreating = true;
    createProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: files.length };
    downloadUrl_ = null;
    
    worker!.postMessage({ 
      type: 'create', 
      data: { archiveName, compressionLevel } 
    });
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  onDestroy(() => {
    if (worker) {
      worker.terminate();
    }
    if (downloadUrl_) {
      URL.revokeObjectURL(downloadUrl_);
    }
  });
</script>

<svelte:head>
  <title>Create ZIP - Unzip Files Online</title>
</svelte:head>

<div class="w-full max-w-4xl mx-auto space-y-6">
  <header class="space-y-2">
    <h1 class="text-display-xl font-semibold text-ink tracking-tight">Create ZIP Archive</h1>
    <p class="text-body-lg text-body">Add files and folders, configure options, and create a ZIP archive entirely in your browser.</p>
  </header>

  <FileCollector 
    files={files}
    onAddFiles={handleAddFiles}
    onRemoveFile={handleRemoveFile}
    onClearAll={handleClearAll}
    disabled={isCreating}
  />

  {#if files.length > 0}
    <ArchiveConfig
      bind:archiveName
      bind:compressionLevel
      disabled={isCreating}
    />

    {#if isCreating}
      <CreateProgress progress={createProgress} />
    {:else}
      <div class="flex justify-center">
        <button
          class="btn-primary w-full sm:w-auto min-w-[200px] py-3 text-button-lg"
          on:click={handleCreate}
          disabled={files.length === 0 || isCreating}
        >
          Create ZIP Archive
        </button>
      </div>
    {/if}

    <div class="card p-4">
      <h3 class="text-heading-md font-semibold text-ink mb-3">Archive Summary</h3>
      <dl class="grid grid-cols-2 gap-3 text-body-md">
        <dt class="text-body">Files</dt>
        <dd class="text-ink font-mono text-right">{files.length}</dd>
        <dt class="text-body">Total Size</dt>
        <dd class="text-ink font-mono text-right">{formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}</dd>
        <dt class="text-body">Compression</dt>
        <dd class="text-ink font-mono text-right">Level {compressionLevel} ({compressionLevel === 0 ? 'Store' : compressionLevel <= 4 ? 'Fast' : compressionLevel <= 7 ? 'Balanced' : 'Best'})</dd>
        <dt class="text-body">Output Name</dt>
        <dd class="text-ink font-mono text-right truncate max-w-xs">{archiveName}</dd>
      </dl>
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