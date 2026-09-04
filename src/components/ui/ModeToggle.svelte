<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let mode: 'extract' | 'create' = 'extract';

  const dispatch = createEventDispatcher();

  function handleModeChange(newMode: 'extract' | 'create') {
    mode = newMode;
    dispatch('change', { mode: newMode });
    if (newMode === 'extract') {
      window.location.href = '/';
    } else {
      window.location.href = '/create';
    }
  }
</script>

<div class="relative" role="group" aria-label="Mode selection">
  <div class="flex items-center gap-1 bg-hairline-soft rounded-pill p-1" aria-label="Switch between Extract ZIP and Create ZIP">
    <button
      type="button"
      role="switch"
      aria-checked={mode === 'extract'}
      aria-label="Extract ZIP mode"
      class="relative flex items-center gap-1.5 rounded-pill px-4 py-1.5 text-button-md font-medium transition-all duration-fast
        {mode === 'extract'
          ? 'bg-canvas-elevated text-ink shadow-whisper'
          : 'text-body hover:text-ink'}"
      on:click={() => handleModeChange('extract')}
    >
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <span class="hidden sm:inline">Extract ZIP</span>
      <span class="sr-only">{mode === 'extract' ? 'Selected' : 'Not selected'}</span>
    </button>

    <button
      type="button"
      role="switch"
      aria-checked={mode === 'create'}
      aria-label="Create ZIP mode"
      class="relative flex items-center gap-1.5 rounded-pill px-4 py-1.5 text-button-md font-medium transition-all duration-fast
        {mode === 'create'
          ? 'bg-canvas-elevated text-ink shadow-whisper'
          : 'text-body hover:text-ink'}"
      on:click={() => handleModeChange('create')}
    >
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span class="hidden sm:inline">Create ZIP</span>
      <span class="sr-only">{mode === 'create' ? 'Selected' : 'Not selected'}</span>
    </button>
  </div>
</div>