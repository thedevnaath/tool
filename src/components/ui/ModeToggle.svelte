<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';

  export let mode: 'extract' | 'create' = 'extract';

  const dispatch = createEventDispatcher();

  let isDark = true;

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
  });

  function handleModeChange(newMode: 'extract' | 'create') {
    mode = newMode;
    dispatch('change', { mode: newMode });
    if (newMode === 'extract') {
      window.location.href = '/';
    } else {
      window.location.href = '/create';
    }
  }

  function toggleTheme() {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
</script>

<div class="relative flex items-center gap-3" role="group" aria-label="Mode and theme selection">
  <div class="flex items-center gap-1 bg-hairline-soft dark:bg-dark-hairline-soft rounded-pill p-1" aria-label="Switch between Extract ZIP and Create ZIP">
    <button
      type="button"
      role="switch"
      aria-checked={mode === 'extract'}
      aria-label="Extract ZIP mode"
      class="relative flex items-center gap-1.5 rounded-pill px-4 py-1.5 text-button-md font-medium transition-all duration-fast
        {mode === 'extract'
          ? 'bg-canvas-elevated text-ink shadow-whisper dark:bg-dark-canvas-elevated dark:text-dark-ink dark:shadow-dark-whisper'
          : 'text-body hover:text-ink dark:text-dark-body dark:hover:text-dark-ink'}"
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
          ? 'bg-canvas-elevated text-ink shadow-whisper dark:bg-dark-canvas-elevated dark:text-dark-ink dark:shadow-dark-whisper'
          : 'text-body hover:text-ink dark:text-dark-body dark:hover:text-dark-ink'}"
      on:click={() => handleModeChange('create')}
    >
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span class="hidden sm:inline">Create ZIP</span>
      <span class="sr-only">{mode === 'create' ? 'Selected' : 'Not selected'}</span>
    </button>
  </div>

  <button
    type="button"
    class="btn-icon"
    on:click={toggleTheme}
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    aria-pressed={isDark}
  >
    {#if isDark}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    {:else}
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    {/if}
  </button>
</div>