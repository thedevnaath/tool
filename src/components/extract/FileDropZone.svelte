<script lang="ts">
  export let isExtracting = $props(false);
  export let onExtract: (file: File) => void = () => {};

  let isDragOver = false;
  let fileInput: HTMLInputElement | null = null;

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!isExtracting) {
      isDragOver = true;
    }
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = false;
    
    if (isExtracting) return;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      handleFile(input.files[0]);
      input.value = '';
    }
  }

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      window.dispatchEvent(new CustomEvent('toast', { 
        detail: { message: 'Please select a ZIP file', type: 'error' } 
      }));
      return;
    }
    onExtract(file);
  }

  function handlePaste(event: ClipboardEvent) {
    if (isExtracting) return;
    
    const items = event.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && file.name.toLowerCase().endsWith('.zip')) {
            handleFile(file);
            break;
          }
        }
      }
    }
  }
</script>

<div 
  class="relative card p-8 sm:p-12 text-center transition-all duration-fast
    {isDragOver ? 'border-link bg-link-soft' : 'border-hairline hover:border-mute'}
    {isExtracting ? 'opacity-50 pointer-events-none' : ''}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:paste={handlePaste}
  tabindex="0"
  role="button"
  aria-label="Drop zone for ZIP files"
>
  <input
    bind:this={fileInput}
    type="file"
    accept=".zip"
    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    on:change={handleFileSelect}
    aria-label="Select ZIP file"
    disabled={isExtracting}
  />

  <div class="flex flex-col items-center gap-4">
    <div class="flex items-center justify-center w-16 h-16 rounded-full bg-hairline-soft text-ink
      {isDragOver ? 'bg-link-soft text-link' : ''} transition-colors">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    </div>

    <div class="space-y-2">
      <h3 class="text-heading-md font-semibold text-ink">Drop your ZIP file here</h3>
      <p class="text-body-md text-body">or click to browse</p>
    </div>

    <p class="text-body-sm text-mute flex items-center gap-1.5">
      <kbd class="px-2 py-0.5 bg-hairline-soft rounded-sm text-body-sm font-mono text-body">Ctrl</kbd>
      <span>+</span>
      <kbd class="px-2 py-0.5 bg-hairline-soft rounded-sm text-body-sm font-mono text-body">V</kbd>
      <span>to paste from clipboard</span>
    </p>

    <div class="flex items-center justify-center gap-4 text-body-sm text-mute pt-2 border-t border-hairline">
      <span class="flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span>.zip</span>
      </span>
      <span class="flex items-center gap-1.5">
        <span class="font-mono">∞</span>
        <span>no size limit</span>
      </span>
      <span class="flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6z" />
        </svg>
        <span>client-side only</span>
      </span>
    </div>
  </div>

  {#if isExtracting}
    <div class="absolute inset-0 bg-canvas/90 backdrop-blur-sm flex items-center justify-center rounded-md">
      <div class="text-center">
        <div class="w-12 h-12 border-3 border-hairline border-t-ink rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
        <p class="text-body-md text-ink">Extracting...</p>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(:focus-visible) {
    @apply outline-none ring-2 ring-link ring-offset-2 ring-offset-canvas-elevated;
  }
</style>