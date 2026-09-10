<script lang="ts">
  export let viewMode: 'preview' | 'source' | 'metadata' | 'rename' = 'source';
  export let showPreview: boolean = false;
  export let isWrapped: boolean = false;
  export let setViewMode: (mode: 'preview' | 'source' | 'metadata' | 'rename') => void;
  export let onToggleWrap: () => void;
  export let onFullscreen: () => void;
  export let onCopy: () => void;
</script>

<div class="flex items-center justify-between px-4 py-2 border-b border-hairline bg-canvas-elevated">
  <div class="flex items-center gap-1 bg-hairline-soft/50 p-1 rounded-md">
    {#if showPreview}
      <button 
        class="px-3 py-1 text-body-sm font-medium rounded-sm transition-colors {viewMode === 'preview' ? 'bg-canvas text-ink shadow-sm' : 'text-mute hover:text-ink'}"
        on:click={() => setViewMode('preview')}
      >
        Preview
      </button>
    {/if}
    <button 
      class="px-3 py-1 text-body-sm font-medium rounded-sm transition-colors {viewMode === 'source' ? 'bg-canvas text-ink shadow-sm' : 'text-mute hover:text-ink'}"
      on:click={() => setViewMode('source')}
    >
      Source
    </button>
    <button 
      class="px-3 py-1 text-body-sm font-medium rounded-sm transition-colors {viewMode === 'metadata' ? 'bg-canvas text-ink shadow-sm' : 'text-mute hover:text-ink'}"
      on:click={() => setViewMode('metadata')}
    >
      Metadata
    </button>
    <button 
      class="px-3 py-1 text-body-sm font-medium rounded-sm transition-colors {viewMode === 'rename' ? 'bg-canvas text-ink shadow-sm' : 'text-mute hover:text-ink'}"
      on:click={() => setViewMode('rename')}
    >
      Rename
    </button>
  </div>
  
  <div class="flex items-center gap-1">
    {#if viewMode === 'source' || viewMode === 'preview'}
      {#if viewMode === 'source'}
        <button class="btn-icon text-mute hover:text-ink {isWrapped ? 'text-link hover:text-link/80' : ''}" on:click={onToggleWrap} aria-label="Toggle Word Wrap" title="Toggle Word Wrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10a2 2 0 110 4H8m-4 0h0m0 0l2-2m-2 2l2 2"/></svg>
        </button>
      {/if}
      <button class="btn-icon text-mute hover:text-ink" on:click={onCopy} aria-label="Copy to Clipboard" title="Copy to Clipboard">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
      </button>
      <button class="btn-icon text-mute hover:text-ink" on:click={onFullscreen} aria-label="Fullscreen" title="Fullscreen">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
      </button>
    {/if}
  </div>
</div>
