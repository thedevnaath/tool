<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import FileCollector from './FileCollector.svelte';
  import ArchiveConfig from './ArchiveConfig.svelte';
  import CreateProgress from './CreateProgress.svelte';
  import { downloadUrl } from '../../lib/download';
  import FileCard from '../extract/FileCard.svelte';
  import { useTranslations } from '../../i18n/utils';
  import { ui } from '../../i18n/ui';

  export let lang = 'en';
  $: t = useTranslations(lang as keyof typeof ui);

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
  let showPassword = false;
  let selectedFileIndex: number | null = null;
  const currentMode = 'create';

  export let title = "Create a ZIP archive";
  export let subtitle = "Drop files or folders and compress them into a ZIP — entirely in your browser.";
  export let eyebrow = "Browser-native · Zero uploads · Instant";

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

  function handleAddFiles(newFiles: File[]) { 
    files = [...files, ...newFiles]; 
    if (newFiles.length > 0) {
      showToast(`Added ${newFiles.length} file${newFiles.length !== 1 ? 's' : ''}`, 'success');
    }
  }
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

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

  <!-- HERO + MODE TABS -->
  <div class="space-y-6">
    <div class="flex items-center justify-center">
      <div class="flex items-center gap-1 p-1 bg-hairline-soft rounded-xl border border-hairline" role="tablist" aria-label="Tool mode">
        <a
          href={lang && lang !== 'en' ? `/${lang}` : '/'}
          role="tab"
          aria-selected={false}
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-button-md font-medium transition-all duration-fast text-mute hover:text-ink"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          {t('extract.tab')}
        </a>
        <a
          href={lang && lang !== 'en' ? `/${lang}/create` : '/create'}
          role="tab"
          aria-selected={true}
          class="flex items-center gap-2 px-5 py-2 rounded-lg text-button-md font-medium transition-all duration-fast bg-canvas-elevated text-ink shadow-whisper border border-hairline"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {t('create.tab')}
        </a>
      </div>
    </div>

    <div class="text-center space-y-3 pb-2">
      <p class="font-mono text-mono-eyebrow text-mute uppercase tracking-widest">{eyebrow}</p>
      <h1 class="text-display-xl font-semibold text-ink tracking-tight">{title}</h1>
      <p class="text-body-lg text-mute max-w-md mx-auto">
        {subtitle}
      </p>
    </div>
  </div>

  <!-- File Collector -->
  <FileCollector
    onAddFiles={handleAddFiles}
    disabled={isCreating}
    {t}
  />

  <!-- Archive config + create button -->
  {#if files.length > 0 && !isCreating}
    <div class="space-y-4 animate-slide-up">
      <!-- File List Header -->
      <div class="flex items-center justify-between">
        <h3 class="text-heading-md font-semibold text-ink">{files.length} {files.length !== 1 ? t('ui.files') : t('ui.file')} {t('ui.ready')}</h3>
        <button
          class="btn-ghost text-body-sm"
          on:click={handleClearAll}
          disabled={isCreating}
          aria-label="Clear all files"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {t('ui.clear_all')}
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
          <span class="text-body-md text-ink font-medium">{t('ui.protect_zip_password')}</span>
        </div>
        <div class="relative w-full max-w-sm">
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={zipPassword} 
            on:input={(e) => zipPassword = e.currentTarget.value}
            placeholder={t('ui.optional_password')} 
            class="input font-mono w-full pr-10"
            disabled={isCreating}
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-mute hover:text-ink transition-colors rounded focus:outline-none focus:ring-2 focus:ring-link flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => showPassword = !showPassword}
            disabled={isCreating}
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

      <ArchiveConfig bind:archiveName bind:compressionLevel disabled={isCreating} {t} />

      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
        <p class="text-body-sm text-mute">
          <span class="text-ink font-medium">{files.length}</span> {t('ui.files')},
          <span class="text-ink font-medium">{(totalSize / (1024 * 1024)).toFixed(1)} MB</span> {t('ui.total')}
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
            class="btn-primary !rounded-none self-stretch px-5 py-2.5 flex items-center gap-2 border-l border-hairline whitespace-nowrap hover:bg-link-soft hover:text-link transition-colors"
            on:click={handleCreateZip}
            disabled={isCreating}
            aria-label="{t('ui.download_zip')} archive"
          >
            <svg class="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('ui.download_zip').split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Progress -->
  {#if isCreating}
    <CreateProgress progress={createProgress} {t} />
  {/if}

  <!-- Download ready -->
  {#if downloadUrl_ && !isCreating}
    <div class="toast-success animate-slide-up">
      <svg class="w-4 h-4 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <div class="flex-1">
        <p class="text-body-md text-ink font-medium">{t('ui.archive_ready') || 'Archive ready!'}</p>
        <p class="text-body-sm text-mute">{t('ui.download_started') || 'Download started automatically.'}</p>
      </div>
      <a href={downloadUrl_} download={archiveName} class="btn-square text-button-sm flex-shrink-0">
        {t('ui.download_again') || 'Download again'}
      </a>
    </div>
  {/if}
</div>

<!-- Toasts -->
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
