<script lang="ts">
  export let viewMode: 'preview' | 'metadata' | 'rename' = 'preview';
  export let setViewMode: (mode: 'preview' | 'metadata' | 'rename') => void;
  export let onZoomIn: () => void;
  export let onZoomOut: () => void;
  export let onFit: () => void;
  export let onActualSize: () => void;
  export let onFullscreen: () => void;
</script>

<div class="flex items-center justify-between px-4 py-2 border-b border-hairline bg-canvas-elevated">
  <div class="flex items-center gap-2">
    <button
      class="btn-ghost {viewMode === 'preview' ? 'bg-hairline-soft text-ink' : 'text-mute hover:text-ink'}"
      on:click={() => setViewMode('preview')}
    >
      Preview
    </button>
    <button
      class="btn-ghost {viewMode === 'metadata' ? 'bg-hairline-soft text-ink' : 'text-mute hover:text-ink'}"
      on:click={() => setViewMode('metadata')}
    >
      Metadata
    </button>
    <button
      class="btn-ghost {viewMode === 'rename' ? 'bg-hairline-soft text-ink' : 'text-mute hover:text-ink'}"
      on:click={() => setViewMode('rename')}
    >
      Rename
    </button>
  </div>
  
  <div class="flex items-center gap-1">
    <button class="btn-icon text-mute hover:text-ink" on:click={onZoomOut} aria-label="Zoom Out" title="Zoom Out">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6"/></svg>
    </button>
    <button class="btn-icon text-mute hover:text-ink" on:click={onZoomIn} aria-label="Zoom In" title="Zoom In">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>
    </button>
    <button class="btn-icon text-mute hover:text-ink" on:click={onFit} aria-label="Fit to Screen" title="Fit to Screen">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
    </button>
    <button class="btn-icon text-mute hover:text-ink" on:click={onActualSize} aria-label="Actual Size" title="Actual Size (100%)">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
    </button>
    <button class="btn-icon text-mute hover:text-ink" on:click={onFullscreen} aria-label="Fullscreen" title="Fullscreen">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
    </button>
  </div>
</div>
