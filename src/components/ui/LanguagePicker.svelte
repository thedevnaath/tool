<script lang="ts">
  import { onMount } from 'svelte';
  
  export let currentLocale = 'en';
  export let links: Array<{lang: string, label: string, href: string, relativeHref?: string}> = [];
  
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

  onMount(() => {
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  });
</script>

<div class="relative" bind:this={menuRef}>
  <button
    type="button"
    class="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-hairline-soft border border-hairline hover:bg-hairline hover:border-mute/40 transition-all duration-fast text-mute hover:text-ink text-body-sm font-medium"
    on:click={toggle}
    aria-label="Change language"
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span class="uppercase">{currentLocale}</span>
  </button>

  {#if isOpen}
    <div class="absolute right-0 mt-2 w-40 bg-canvas-elevated border border-hairline rounded-xl shadow-lg shadow-black/5 overflow-hidden z-50 animate-fade-in" role="menu">
      <div class="py-1">
        {#each links as link}
          <a
            href={link.relativeHref || link.href}
            class="block px-4 py-2 text-body-sm hover:bg-hairline-soft transition-colors {link.lang === currentLocale ? 'text-ink font-semibold' : 'text-mute hover:text-ink'}"
            role="menuitem"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
