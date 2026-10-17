<script lang="ts">
  import { onMount } from 'svelte';
  import FileDropZone from './FileDropZone.svelte';
  import FileTree from './FileTree.svelte';
  import FileList from './FileList.svelte';
  import DownloadAllButton from './DownloadAllButton.svelte';
  import { buildFileTree } from '../../lib/file-utils';
  import { downloadUrl } from '../../lib/download';
  import type { FileEntry, FileTreeNode } from '../../lib/file-utils';
  import { useTranslations } from '../../i18n/utils';
  import { ui } from '../../i18n/ui';

  export let lang = 'en';
  $: t = useTranslations(lang as keyof typeof ui);

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
  
  let currentFile: File | null = null;
  let needsPassword = false;
  let passwordInput = '';
  let showPassword = false;

  export let title = "Unzip files instantly";
  export let subtitle = "Drop any ZIP file and extract it entirely in your browser. Nothing leaves your device.";
  export let eyebrow = "Browser-native · Zero uploads · Instant";

  // Detect current mode from URL
  const currentMode = typeof window !== 'undefined' && window.location.pathname.includes('/create') ? 'create' : 'extract';

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
          isExtracting = true;
          needsPassword = false;
          extractProgress = data;
          break;
        case 'complete':
          files = data.files;
          fileTree = buildFileTree(data.files);
          isExtracting = false;
          needsPassword = false;
          showToast(`Extracted ${data.files.length} files successfully`, 'success');
          break;
        case 'passwordRequired':
          isExtracting = false;
          needsPassword = true;
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
          needsPassword = false;
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
    currentFile = file;
    isExtracting = true;
    needsPassword = false;
    passwordInput = '';
    showPassword = false;
    extractProgress = { loaded: 0, total: 0, currentFile: '', fileIndex: 0, totalFiles: 0 };
    files = [];
    fileTree = [];
    selectedFileIndex = null;
    worker!.postMessage({ type: 'extract', data: { file } });
  }

  function handlePasswordInput() {
    if (currentFile && worker) {
      worker.postMessage({ type: 'extract', data: { file: currentFile, password: passwordInput } });
    }
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
    currentFile = null;
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
    const handleContentRequest = (e: Event) => {
      const index = (e as CustomEvent).detail.fileIndex;
      if (worker) worker.postMessage({ type: 'getContent', data: { fileIndex: index } });
    };
    const handleDownloadRequest = (e: Event) => handleFileDownload((e as CustomEvent).detail.fileIndex);
    const handleRenameRequest = (e: Event) => handleFileRename(e);
    const handleToastRequest = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail || {};
      if (message) showToast(message, type || 'success');
    };
    window.addEventListener('request-file-content', handleContentRequest);
    window.addEventListener('request-download', handleDownloadRequest);
    window.addEventListener('rename-file', handleRenameRequest);
    window.addEventListener('show-toast', handleToastRequest);
    return () => {
      window.removeEventListener('request-file-content', handleContentRequest);
      window.removeEventListener('request-download', handleDownloadRequest);
      window.removeEventListener('rename-file', handleRenameRequest);
      window.removeEventListener('show-toast', handleToastRequest);
    };
  });

  $: progressPct = extractProgress.total > 0 ? Math.round((extractProgress.loaded / extractProgress.total) * 100) : 0;
  $: fileCount = files.filter(f => !f.isDirectory).length;
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

  <!-- HERO HEADER with mode tabs -->
  <div class="space-y-6">
    <!-- Mode toggle tabs -->
    <div class="flex items-center justify-center">
      <div class="flex items-center gap-1 p-1 bg-hairline-soft rounded-xl border border-hairline" role="tablist" aria-label="Tool mode">
        <a
          href={lang && lang !== 'en' ? `/${lang}` : '/'}
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
          {t('extract.tab')}
        </a>
        <a
          href={lang && lang !== 'en' ? `/${lang}/create` : '/create'}
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
          {t('create.tab')}
        </a>
      </div>
    </div>

    <!-- Hero text -->
    <div class="text-center space-y-3 pb-2">
      <p class="font-mono text-mono-eyebrow text-mute uppercase tracking-widest">{eyebrow}</p>
      <h1 class="text-[clamp(1.75rem,8vw,3rem)] leading-[1.1] sm:text-display-xl sm:leading-none font-semibold text-ink tracking-tight">
        {title}
      </h1>
      <p class="text-body-lg text-mute max-w-md mx-auto">
        {subtitle}
      </p>
    </div>
  </div>

  <!-- DROP ZONE -->
  <FileDropZone on:extract={(e) => handleExtract(e.detail)} {isExtracting} {t} />

  <!-- PASSWORD PROMPT -->
  {#if needsPassword}
    <div class="card p-5 animate-slide-up space-y-3">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
        <span class="text-body-md text-ink font-medium">{t('ui.password_protected')}</span>
      </div>
      <div class="relative w-full max-w-sm">
        <input 
          type={showPassword ? 'text' : 'password'} 
          value={passwordInput} 
          on:input={(e) => { passwordInput = e.currentTarget.value; handlePasswordInput(); }}
          placeholder={t('ui.enter_password')} 
          class="input font-mono w-full pr-10"
          autofocus
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-mute hover:text-ink transition-colors rounded focus:outline-none focus:ring-2 focus:ring-link flex items-center justify-center"
          on:click={() => showPassword = !showPassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {#if showPassword}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          {:else}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <!-- EXTRACTION PROGRESS -->
  {#if isExtracting}
    <div class="card p-5 animate-slide-up" role="progressbar" aria-valuenow={progressPct} aria-valuemin="0" aria-valuemax="100" aria-label="Extraction progress">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-hairline border-t-ink rounded-full animate-spin" aria-hidden="true"></div>
          <span class="text-body-md text-ink font-medium">{t('ui.extracting')}</span>
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

      <!-- Mobile: File info badges on top of file structure box -->
      <div class="flex items-center gap-2 sm:hidden px-0.5">
        {#if currentFile}
          <span class="font-mono text-body-sm text-mute bg-hairline-soft px-2 py-0.5 rounded-md truncate max-w-[calc(100%-90px)]" title={currentFile.name}>{currentFile.name}</span>
        {/if}
        <span class="font-mono text-body-sm text-mute bg-hairline-soft px-2 py-0.5 rounded-md shrink-0">{files.length} {t('ui.items')}</span>
      </div>

      <!-- File Tree -->
      <div class="card overflow-hidden sm:!mt-0">
        <button
          class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-hairline-soft transition-colors duration-fast"
          on:click={() => treeCollapsed = !treeCollapsed}
          aria-expanded={!treeCollapsed}
          aria-controls="file-tree-panel"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-mute shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="text-body-md font-medium text-ink shrink-0">{t('ui.file_structure')}</span>
            {#if currentFile}
              <span class="font-mono text-body-sm text-mute bg-hairline-soft px-2 py-0.5 rounded-md truncate max-w-[160px] sm:max-w-xs md:max-w-sm hidden sm:inline-block" title={currentFile.name}>{currentFile.name}</span>
            {/if}
            <span class="font-mono text-body-sm text-mute bg-hairline-soft px-2 py-0.5 rounded-md shrink-0 hidden sm:inline-block">{files.length} {t('ui.items')}</span>
          </div>
          <svg
            class="w-4 h-4 text-mute shrink-0 transition-transform duration-fast {treeCollapsed ? '' : 'rotate-180'}"
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
              onSelect={handleFileSelect}
              showHiddenFiles={showHiddenFiles}
              onToggleHidden={(v) => { showHiddenFiles = v; }}
              {t}
            />
          </div>
        {/if}
      </div>

      <!-- Download All + stats bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-1">
        <div class="flex items-center justify-between sm:justify-start gap-4">
          <p class="text-body-sm text-mute">
            <span class="text-ink font-medium">{fileCount}</span> {t('ui.ready_download')}
          </p>
          <button
            class="btn-ghost text-error hover:bg-error-soft text-body-sm sm:hidden"
            on:click={handleClear}
            aria-label="Clear and start over"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('ui.clear')}
          </button>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button
            class="btn-ghost text-error hover:bg-error-soft text-body-sm hidden sm:inline-flex"
            on:click={handleClear}
            aria-label="Clear and start over"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('ui.clear')}
          </button>
          <DownloadAllButton onClick={handleDownloadAll} disabled={fileCount === 0} count={fileCount} {t} />
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
<div class="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:left-auto sm:right-5 z-50 flex flex-col items-center sm:items-end gap-2 pointer-events-none" aria-live="polite" aria-atomic="false">
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
