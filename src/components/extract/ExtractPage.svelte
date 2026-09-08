<script lang="ts">
  import { onMount } from 'svelte';
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
  let treeCollapsed = false;
  let toastId = 0;

  // Detect current mode from URL
  const currentMode = typeof window !== 'undefined' && window.location.pathname === '/create' ? 'create' : 'extract';

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++toastId;
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => dismissToast(id), 5000);
  }

  function dismissToast(id: number) {
    toasts = toasts.filter(t => t.id !== id);
  }

  function toastClass(type: string): string {
    if (type === 'success') return 'toast-success';
    if (type === 'error') return 'toast-error';
    return 'toast-info';
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
          showToast(`Extracted ${data.files.length} files successfully`, 'success');
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
    window.dispatchEvent(new CustomEvent('file-content', {
      detail: { fileIndex: data.fileIndex, content: data.content, mimeType: data.mimeType, filename: data.filename }
    }));
  }

  function handleFileSelect(index: number) {
    selectedFileIndex = index;
    if (worker) worker.postMessage({ type: 'getContent', data: { fileIndex: index } });
  }

  function handleFileDownload(index: number) {
    if (worker) worker.postMessage({ type: 'downloadFile', data: { fileIndex: index } });
  }

  function handleDownloadAll() {
    if (!worker || files.length === 0) return;
    const fileIndices = files.map((_, i) => i);
    worker.postMessage({ type: 'downloadAll', data: { fileIndices } });
    showToast('Preparing download...', 'info');
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
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }

  function handleFileRename(e: Event) {
    const { fileIndex, newName } = (e as CustomEvent).detail;
    if (fileIndex >= 0 && fileIndex < files.length) {
      const newFiles = [...files];
      newFiles[fileIndex] = { ...newFiles[fileIndex], filename: newName };
      files = newFiles;
      fileTree = buildFileTree(files);
      showToast('File renamed for this session', 'success');
    }
  }

  onMount(() => {
    const handleContentRequest = (e: Event) => handleFileSelect((e as CustomEvent).detail.fileIndex);
    const handleDownloadRequest = (e: Event) => handleFileDownload((e as CustomEvent).detail.fileIndex);
    const handleRenameRequest = (e: Event) => handleFileRename(e);
    window.addEventListener('request-file-content', handleContentRequest);
    window.addEventListener('request-download', handleDownloadRequest);
    window.addEventListener('rename-file', handleRenameRequest);
    return () => {
      window.removeEventListener('request-file-content', handleContentRequest);
      window.removeEventListener('request-download', handleDownloadRequest);
      window.removeEventListener('rename-file', handleRenameRequest);
    };
  });

  $: progressPct = extractProgress.total > 0 ? Math.round((extractProgress.loaded / extractProgress.total) * 100) : 0;
  $: fileCount = files.filter(f => !f.isDirectory).length;
</script>

<svelte:head>
  <title>Extract ZIP - Unzip Files Online</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

  <!-- HERO HEADER with mode tabs -->
  <div class="space-y-6">
    <!-- Mode toggle tabs -->
    <div class="flex items-center justify-center">
      <div class="flex items-center gap-1 p-1 bg-hairline-soft rounded-xl border border-hairline" role="tablist" aria-label="Tool mode">
        <a
          href="/"
          role="tab"
          aria-selected={currentMode === 'extract'}
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-button-md font-medium transition-all duration-fast
            {currentMode === 'extract'
              ? 'bg-canvas-elevated text-ink shadow-whisper border border-hairline'
              : 'text-mute hover:text-ink'}"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Extract ZIP
        </a>
        <a
          href="/create"
          role="tab"
          aria-selected={currentMode === 'create'}
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-button-md font-medium transition-all duration-fast
            {currentMode === 'create'
              ? 'bg-canvas-elevated text-ink shadow-whisper border border-hairline'
              : 'text-mute hover:text-ink'}"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create ZIP
        </a>
      </div>
    </div>

    <!-- Hero text -->
    <div class="text-center space-y-3 pb-2">
      <p class="font-mono text-mono-eyebrow text-mute uppercase tracking-widest">Browser-native · Zero uploads · Instant</p>
      <h1 class="text-display-xl font-semibold text-ink tracking-tight">
        Unzip files instantly
      </h1>
      <p class="text-body-lg text-mute max-w-md mx-auto">
        Drop any ZIP file and extract it entirely in your browser. Nothing leaves your device.
      </p>
    </div>
  </div>

  <!-- DROP ZONE -->
  <FileDropZone on:extract={(e) => handleExtract(e.detail)} {isExtracting} />

  <!-- EXTRACTION PROGRESS -->
  {#if isExtracting}
    <div class="card p-5 animate-slide-up" role="progressbar" aria-valuenow={progressPct} aria-valuemin="0" aria-valuemax="100" aria-label="Extraction progress">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-hairline border-t-ink rounded-full animate-spin" aria-hidden="true"></div>
          <span class="text-body-md text-ink font-medium">Extracting files...</span>
        </div>
        <span class="font-mono text-body-sm text-mute">{extractProgress.fileIndex} / {extractProgress.totalFiles}</span>
      </div>
      <div class="progress-track">
        <div class="progress-bar" style="width: {progressPct}%"></div>
      </div>
      {#if extractProgress.currentFile}
        <p class="text-body-sm text-faint mt-2 truncate font-mono">{extractProgress.currentFile}</p>
      {/if}
    </div>
  {/if}

  <!-- RESULTS: File tree + download all + file list -->
  {#if files.length > 0}
    <div class="space-y-4 animate-fade-in">

      <!-- File Tree -->
      <div class="card overflow-hidden">
        <button
          class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-hairline-soft transition-colors duration-fast"
          on:click={() => treeCollapsed = !treeCollapsed}
          aria-expanded={!treeCollapsed}
          aria-controls="file-tree-panel"
        >
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="text-body-md font-medium text-ink">File Structure</span>
            <span class="font-mono text-body-sm text-mute bg-hairline-soft px-2 py-0.5 rounded-md">{files.length} items</span>
          </div>
          <svg
            class="w-4 h-4 text-mute transition-transform duration-fast {treeCollapsed ? '' : 'rotate-180'}"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {#if !treeCollapsed}
          <div id="file-tree-panel" class="border-t border-hairline animate-expand-down">
            <FileTree
              tree={fileTree}
              selectedIndex={selectedFileIndex}
              onselect={handleFileSelect}
              showHiddenFiles={showHiddenFiles}
              onToggleHidden={(v) => { showHiddenFiles = v; }}
            />
          </div>
        {/if}
      </div>

      <!-- Download All + stats bar -->
      <div class="flex items-center justify-between gap-4 py-1">
        <p class="text-body-sm text-mute">
          <span class="text-ink font-medium">{fileCount}</span> files ready to download
        </p>
        <div class="flex items-center gap-2">
          <button
            class="btn-ghost text-error hover:bg-error-soft text-body-sm"
            on:click={handleClear}
            aria-label="Clear and start over"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
          <DownloadAllButton onClick={handleDownloadAll} disabled={fileCount === 0} count={fileCount} />
        </div>
      </div>

      <!-- File Cards -->
      <FileList
        files={files}
        selectedIndex={selectedFileIndex}
        onSelect={handleFileSelect}
        showHiddenFiles={showHiddenFiles}
      />
    </div>
  {/if}
</div>

<!-- Toast Notifications -->
<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite" aria-atomic="false">
  {#each toasts as toast (toast.id)}
    <div class="{toastClass(toast.type)} pointer-events-auto max-w-sm" role="alert">
      <div class="flex items-start gap-3">
        {#if toast.type === 'success'}
          <svg class="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {:else if toast.type === 'error'}
          <svg class="w-4 h-4 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {:else}
          <svg class="w-4 h-4 text-link flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
        <p class="flex-1 text-body-md text-ink">{toast.message}</p>
        <button
          class="flex-shrink-0 text-mute hover:text-ink transition-colors p-0.5"
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
