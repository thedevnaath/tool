<script lang="ts">
  import FileCard from './FileCard.svelte';
  import type { FileEntry } from '../../lib/file-utils';
  
  export let files: FileEntry[] = $props();
  export let selectedIndex: number | null = $props();
  export let onSelect: (index: number) => void = () => {};
  export let showHiddenFiles: boolean = $props(false);

  $: visibleFiles = files.filter(f => !f.isDirectory && (showHiddenFiles || !f.filename.startsWith('.')));
</script>

{#if visibleFiles.length === 0}
  <div class="card p-12 text-center">
    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-hairline-soft flex items-center justify-center">
      <svg class="w-8 h-8 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 class="text-heading-md font-semibold text-ink mb-2">No files to display</h3>
    <p class="text-body-md text-body">Select a folder from the tree or extract a ZIP file to see files here.</p>
  </div>
{:else}
  <div class="space-y-3" role="list" aria-label="File list">
    {#each visibleFiles as file, i}
      <FileCard
        file={file}
        index={file.index ?? i}
        isSelected={file.index === selectedIndex}
        onSelect={onSelect}
      />
    {/each}
  </div>
{/if}