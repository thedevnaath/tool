<script lang="ts">
  import { onMount } from 'svelte';

  export let items: Array<{
    label: string;
    href: string;
    isActive?: boolean;
  }> = [];

  let isOpen = false;
  let menuRef: HTMLDivElement;

  function toggle() {
    isOpen = !isOpen;
  }

  function closeMenu(e: MouseEvent) {
    if (isOpen && menuRef && !menuRef.contains(e.target as Node)) {
      isOpen = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', closeMenu);
    window.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('click', closeMenu);
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="relative" bind:this={menuRef}>
  <button
    type="button"
    class="flex items-center justify-center w-8 h-8 rounded-lg bg-hairline-soft border transition-all duration-fast {isOpen ? 'border-mute/40 bg-hairline text-ink' : 'border-hairline text-mute hover:text-ink hover:bg-hairline hover:border-mute/40'}"
    on:click={toggle}
    aria-label="Navigation menu"
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  {#if isOpen}
    <div
      class="absolute right-0 mt-2 w-48 bg-canvas-elevated border border-hairline rounded-xl shadow-lg shadow-black/5 overflow-hidden z-50 animate-fade-in"
      role="menu"
      aria-orientation="vertical"
    >
      <div class="py-1">
        {#each items as item}
          <a
            href={item.href}
            class="block px-4 py-2 text-body-sm hover:bg-hairline-soft transition-colors {item.isActive ? 'text-ink font-semibold' : 'text-mute hover:text-ink'}"
            role="menuitem"
            on:click={() => (isOpen = false)}
          >
            {item.label}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
