<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let isExtracting = false;

  const dispatch = createEventDispatcher();
  let isDragOver = false;
  let fileInput: HTMLInputElement | null = null;

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!isExtracting) isDragOver = true;
  }
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
  }
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    if (isExtracting) return;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) handleFile(files[0]);
  }
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      handleFile(input.files[0]);
      input.value = '';
    }
  }
  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.zip')) return;
    dispatch('extract', file);
  }
  function handlePaste(event: ClipboardEvent) {
    if (isExtracting) return;
    const items = event.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && file.name.toLowerCase().endsWith('.zip')) { handleFile(file); break; }
        }
      }
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="relative card overflow-hidden transition-all duration-normal
    {isDragOver
      ? 'border-link bg-link-soft scale-[1.01]'
      : 'border-hairline hover:border-mute'
    }
    {isExtracting ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:paste={handlePaste}
  tabindex={isExtracting ? -1 : 0}
  role="button"
  aria-label="Drop zone for ZIP files — click or drag to upload"
  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInput?.click(); }}
>
  <input
    bind:this={fileInput}
    type="file"
    accept=".zip"
    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    on:change={handleFileSelect}
    aria-label="Select ZIP file"
    disabled={isExtracting}
    tabindex="-1"
  />

  <div class="flex flex-col items-center gap-5 py-14 px-8 sm:py-20">
    <!-- Icon -->
    <div class="relative">
      <div class="flex items-center justify-center w-16 h-16 rounded-2xl border border-hairline bg-hairline-soft
        {isDragOver ? 'border-link/50 bg-link-soft scale-110' : ''} transition-all duration-normal">
        <svg class="w-8 h-8 {isDragOver ? 'text-link' : 'text-mute'} transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      {#if isDragOver}
        <div class="absolute -inset-3 rounded-2xl border border-link/30 animate-pulse-glow pointer-events-none"></div>
      {/if}
    </div>

    <!-- Text -->
    <div class="text-center space-y-1.5">
      <h2 class="text-heading-sm font-semibold text-ink">
        {isDragOver ? 'Release to extract' : 'Drop your ZIP file here'}
      </h2>
      <p class="text-body-md text-mute">
        or <span class="text-ink underline underline-offset-2">click to browse</span>
      </p>
    </div>

    <!-- Feature pills -->
    <div class="flex flex-wrap items-center justify-center gap-2">
      {#each ['.zip only', 'No size limit', 'Client-side only', 'Ctrl+V to paste'] as feat}
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-hairline bg-hairline-soft text-body-sm text-mute font-mono">
          {feat}
        </span>
      {/each}
    </div>
  </div>

  {#if isExtracting}
    <div class="absolute inset-0 bg-canvas/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-hairline border-t-ink rounded-full animate-spin mx-auto mb-3" aria-hidden="true"></div>
        <p class="text-body-md text-mute">Extracting...</p>
      </div>
    </div>
  {/if}
</div>
