<script lang="ts">
  import FileCard from './FileCard.svelte';
  import type { FileEntry } from '../../lib/file-utils';

  export let files: FileEntry[];
  export let selectedIndex: number | null;
  export let onSelect: (index: number) => void = () => {};
  export let showHiddenFiles: boolean = false;

  $: visibleFiles = files.filter(f => !f.isDirectory && (showHiddenFiles || !f.filename.split('/').pop()?.startsWith('.')));
</script>

{#if visibleFiles.length === 0}
  <div class="card p-12 text-center">
    <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-hairline-soft border border-hairline flex items-center justify-center">
      <svg class="w-6 h-6 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 class="text-heading-sm font-semibold text-ink mb-1">No files</h3>
    <p class="text-body-md text-mute">The archive appears to be empty or contains only directories.</p>
  </div>
{:else}
  <div class="space-y-2.5" role="list" aria-label="Extracted files">
    {#each visibleFiles as file, i (file.filename)}
      <FileCard
        file={file}
        index={file.index ?? i}
        isSelected={file.index === selectedIndex}
        onSelect={onSelect}
      />
    {/each}
  </div>
{/if}
