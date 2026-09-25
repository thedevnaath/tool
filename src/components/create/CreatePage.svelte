<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import FileCollector from './FileCollector.svelte';
  import ArchiveConfig from './ArchiveConfig.svelte';
  import CreateProgress from './CreateProgress.svelte';
  import { downloadUrl } from '../../lib/download';
  import FileCard from '../extract/FileCard.svelte';

  let files: File[] = [];
  let archiveName = 'Archive';
  let compressionLevel = 6;
  let isCreating = false;
  let createProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: 0 };
  let toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }> = [];
  let worker: Worker | null = null;
  let downloadUrl_: string | null = null;
  let toastId = 0;
  let zipPassword = '';
  let selectedFileIndex: number | null = null;
  const currentMode = 'create';

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++toastId;
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => dismissToast(id), 5000);
  }
  function dismissToast(id: number) { toasts = toasts.filter(t => t.id !== id); }

  function toastClass(type: string): string {
    if (type === 'success') return 'toast-success';
    if (type === 'error') return 'toast-error';
    return 'toast-info';
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
          downloadUrl(data.url, data.filename || archiveName);
          showToast('Archive created! Download started.', 'success');
          break;
        case 'error':
          isCreating = false;
          showToast(data.message, 'error');
          break;
      }
    };
  }

  function handleCreateZip() {
    if (files.length === 0) { showToast('Add files first', 'error'); return; }
    initWorker();
    isCreating = true;
    downloadUrl_ = null;
    createProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: files.length };
    const finalName = archiveName.trim() === '' ? 'Archive.zip' : (archiveName.trim().endsWith('.zip') ? archiveName.trim() : `${archiveName.trim()}.zip`);
    worker!.postMessage({ type: 'create', data: { files, archiveName: finalName, compressionLevel, password: zipPassword } });
  }

  function handleAddFiles(newFiles: File[]) { files = [...files, ...newFiles]; }
  function handleRemoveFile(index: number) { files = files.filter((_, i) => i !== index); }
  function handleClearAll() { files = []; }

  function toFileEntry(file: File, index: number): any {
    const filename = (file as any).webkitRelativePath || file.name;
    const parts = filename.split('/');
    return {
      filename,
      isDirectory: false,
      uncompressedSize: file.size,
      compressedSize: file.size,
      lastModDate: new Date(file.lastModified),
      path: parts,
      depth: parts.length - 1,
      index,
      mimeType: file.type || ''
    };
  }

  async function handleFileSelect(index: number) {
    selectedFileIndex = index === selectedFileIndex ? null : index;
  }

  function handleFileRename(e: Event) {
    const { fileIndex, newName } = (e as CustomEvent).detail;
    if (fileIndex >= 0 && fileIndex < files.length) {
      const file = files[fileIndex];
      const newFile = new File([file], newName.split('/').pop() || newName, {
        type: file.type,
        lastModified: file.lastModified
      });
      Object.defineProperty(newFile, 'webkitRelativePath', { value: newName, writable: true, configurable: true });
      files[fileIndex] = newFile;
      files = [...files];
      showToast('File renamed for this session', 'success');
    }
  }

  onMount(() => {
    const handleContentRequest = async (e: Event) => {
      const index = (e as CustomEvent).detail.fileIndex;
      const file = files[index];
      if (file) {
        const buffer = await file.arrayBuffer();
        window.dispatchEvent(new CustomEvent('file-content', {
          detail: {
            fileIndex: index,
            content: buffer,
            mimeType: file.type || 'application/octet-stream',
            filename: (file as any).webkitRelativePath || file.name
          }
        }));
      }
    };
    const handleRenameRequest = (e: Event) => handleFileRename(e);
    
    window.addEventListener('request-file-content', handleContentRequest);
    window.addEventListener('rename-file', handleRenameRequest);
    return () => {
      window.removeEventListener('request-file-content', handleContentRequest);
      window.removeEventListener('rename-file', handleRenameRequest);
    };
  });

  onDestroy(() => { if (worker) { worker.terminate(); worker = null; } });

  $: totalSize = files.reduce((sum, f) => sum + f.size, 0);
  $: progressPct = createProgress.total > 0 ? Math.round((createProgress.loaded / createProgress.total) * 100) : 0;
</script>

<svelte:head>
  <title>Create ZIP - Unzip Files Online</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

  <!-- HERO + MODE TABS -->
  <div class="space-y-6">
    <div class="flex items-center justify-center">
      <div class="flex items-center gap-1 p-1 bg-hairline-soft rounded-xl border border-hairline" role="tablist" aria-label="Tool mode">
        <a
          href="/"
          role="tab"
          aria-selected={false}
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-button-md font-medium transition-all duration-fast text-mute hover:text-ink"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Extract ZIP
        </a>
        <a
          href="/create"
          role="tab"
          aria-selected={true}
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-button-md font-medium transition-all duration-fast bg-canvas-elevated text-ink shadow-whisper border border-hairline"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create ZIP
        </a>
      </div>
    </div>

    <div class="text-center space-y-3 pb-2">
      <p class="font-mono text-mono-eyebrow text-mute uppercase tracking-widest">Browser-native · Zero uploads · Instant</p>
      <h1 class="text-display-xl font-semibold text-ink tracking-tight">Create a ZIP archive</h1>
      <p class="text-body-lg text-mute max-w-md mx-auto">
        Drop files or folders and compress them into a ZIP — entirely in your browser.
      </p>
    </div>
  </div>

  <!-- File Collector -->
  <FileCollector
    onAddFiles={handleAddFiles}
    disabled={isCreating}
  />

  <!-- Archive config + create button -->
  {#if files.length > 0 && !isCreating}
    <div class="space-y-4 animate-slide-up">
      <!-- File List Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-heading-md font-semibold text-ink">{files.length} file{files.length !== 1 ? 's' : ''} ready</h3>
        <button
          class="btn-ghost text-body-sm"
          on:click={handleClearAll}
          disabled={isCreating}
          aria-label="Clear all files"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear all
        </button>
      </div>

      <!-- File List -->
      <div class="space-y-2.5" role="list" aria-label="Files to archive">
        {#each files as file, index}
          <FileCard
            file={toFileEntry(file, index)}
            index={index}
            isSelected={selectedFileIndex === index}
            onSelect={handleFileSelect}
            hideDownload={true}
          />
        {/each}
      </div>

      <!-- Password Prompt -->
      <div class="card p-5 space-y-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span class="text-body-md text-ink font-medium">Protect ZIP with password</span>
        </div>
        <input 
          type="password" 
          bind:value={zipPassword} 
          placeholder="Optional password..." 
          class="input font-mono w-full max-w-sm"
          disabled={isCreating}
        />
      </div>

      <ArchiveConfig bind:archiveName bind:compressionLevel disabled={isCreating} />

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
        <p class="text-body-sm text-mute">
          <span class="text-ink font-medium">{files.length}</span> files,
          <span class="text-ink font-medium">{(totalSize / (1024 * 1024)).toFixed(1)} MB</span> total
        </p>
        
        <div class="flex items-center w-full sm:w-auto min-w-[300px] max-w-sm rounded-lg border border-hairline overflow-hidden focus-within:border-link bg-canvas shadow-sm transition-colors">
          <input
            bind:value={archiveName}
            type="text"
            class="input flex-1 border-none focus:ring-0 bg-transparent py-2.5 min-w-0 !shadow-none"
            placeholder="Archive"
            disabled={isCreating}
            aria-label="Archive name"
          />
          <div class="px-2 text-faint font-mono text-body-sm bg-transparent flex items-center h-full whitespace-nowrap select-none">
            .zip
          </div>
          <button
            class="btn-primary rounded-none h-full px-5 py-2.5 flex items-center gap-2 border-l border-hairline whitespace-nowrap hover:bg-link-soft hover:text-link transition-colors"
            on:click={handleCreateZip}
            disabled={isCreating}
            aria-label="Download ZIP archive"
          >
            <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Progress -->
  {#if isCreating}
    <CreateProgress progress={createProgress} />
  {/if}

  <!-- Download ready -->
  {#if downloadUrl_ && !isCreating}
    <div class="toast-success animate-slide-up">
      <svg class="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <div class="flex-1">
        <p class="text-body-md text-ink font-medium">Archive ready!</p>
        <p class="text-body-sm text-mute">Download started automatically.</p>
      </div>
      <a href={downloadUrl_} download={archiveName} class="btn-square text-button-sm flex-shrink-0">
        Download again
      </a>
    </div>
  {/if}
</div>

<!-- Toasts -->
<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
  {#each toasts as toast (toast.id)}
    <div class="{toastClass(toast.type)} pointer-events-auto max-w-sm" role="alert">
      <div class="flex items-start gap-3">
        <p class="flex-1 text-body-md text-ink">{toast.message}</p>
        <button
          class="flex-shrink-0 text-mute hover:text-ink transition-colors"
          on:click={() => dismissToast(toast.id)}
          aria-label="Dismiss"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {/each}
</div>
