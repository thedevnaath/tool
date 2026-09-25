<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FileEntry } from '../../../lib/file-utils';
  import MetadataView from './image-preview/MetadataView.svelte';
  import RenameView from './image-preview/RenameView.svelte';

  export let file: FileEntry;
  export let mimeType: string = '';

  const dispatch = createEventDispatcher();
  let viewMode: 'metadata' | 'rename' = 'metadata';

  function onRename(event: CustomEvent<string>) {
    dispatch('rename', event.detail);
    viewMode = 'metadata';
  }
</script>

<div class="flex flex-col bg-canvas border-t border-hairline animate-expand-down min-h-[300px]">
  <div class="flex items-center gap-2 p-2 border-b border-hairline bg-canvas-elevated">
    <button class="px-3 py-1.5 rounded-md text-button-sm font-medium transition-colors {viewMode === 'metadata' ? 'bg-canvas shadow-whisper text-ink' : 'text-mute hover:text-ink hover:bg-hairline-soft'}" on:click={() => viewMode = 'metadata'}>
      Metadata
    </button>
    <button class="px-3 py-1.5 rounded-md text-button-sm font-medium transition-colors {viewMode === 'rename' ? 'bg-canvas shadow-whisper text-ink' : 'text-mute hover:text-ink hover:bg-hairline-soft'}" on:click={() => viewMode = 'rename'}>
      Rename
    </button>
  </div>
  <div class="p-4 flex-1 overflow-auto relative">
    {#if viewMode === 'metadata'}
      <MetadataView {file} {mimeType} />
    {:else if viewMode === 'rename'}
      <RenameView {file} onCancel={() => viewMode = 'metadata'} on:rename={onRename} />
    {/if}
  </div>
</div>
