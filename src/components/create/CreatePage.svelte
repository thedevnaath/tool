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
    const name = archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`;
    worker!.postMessage({ type: 'create', data: { files, archiveName: name, compressionLevel } });
  }

  function handleAddFiles(newFiles: File[]) { files = [...files, ...newFiles]; }
  function handleRemoveFile(index: number) { files = files.filter((_, i) => i !== index); }
  function handleClearAll() { files = []; }

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
    files={files}
    onAddFiles={handleAddFiles}
    onRemoveFile={handleRemoveFile}
    onClearAll={handleClearAll}
    disabled={isCreating}
  />

  <!-- Archive config + create button -->
  {#if files.length > 0 && !isCreating}
    <div class="space-y-4 animate-slide-up">
      <ArchiveConfig bind:archiveName bind:compressionLevel disabled={isCreating} />

      <div class="flex items-center justify-between gap-4 pt-1">
        <p class="text-body-sm text-mute">
          <span class="text-ink font-medium">{files.length}</span> files,
          <span class="text-ink font-medium">{(totalSize / (1024 * 1024)).toFixed(1)} MB</span> total
        </p>
        <button
          class="btn-primary flex items-center gap-2"
          on:click={handleCreateZip}
          aria-label="Create ZIP archive"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Create ZIP
        </button>
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
