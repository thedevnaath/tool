<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FileEntry } from '../../../lib/file-utils';

  export let file: FileEntry;
  export let onCancel: () => void;

  const dispatch = createEventDispatcher<{ rename: string }>();

  $: parts = file.filename.split('/');
  $: filename = parts.pop() || '';
  $: extIndex = filename.lastIndexOf('.');
  $: hasExt = extIndex > 0;
  $: baseName = hasExt ? filename.substring(0, extIndex) : filename;
  $: extension = hasExt ? filename.substring(extIndex) : '';
  $: dirname = parts.length > 0 ? parts.join('/') + '/' : '';

  let newName = '';
  
  // Initialize once
  let initialized = false;
  $: if (!initialized && baseName) {
    newName = baseName;
    initialized = true;
  }

  function handleRename() {
    if (!newName.trim() || newName.trim() === baseName) {
      onCancel();
      return;
    }
    const fullNewName = dirname + newName.trim() + extension;
    dispatch('rename', fullNewName);
  }
</script>

<div class="p-6 bg-canvas w-full h-[60vh] min-h-[300px] flex items-center justify-center border-t border-hairline">
  <div class="bg-canvas-elevated border border-hairline rounded-lg p-6 max-w-md w-full shadow-lg">
    <h3 class="text-heading-sm font-semibold text-ink mb-2">Rename File</h3>
    <p class="text-body-sm text-mute mb-5">Rename this file for the current session. The original ZIP is not modified.</p>
    
    <div class="flex items-center gap-2 mb-6">
      <input 
        type="text" 
        bind:value={newName} 
        class="input flex-1 font-mono text-body-sm bg-canvas border-hairline focus:border-link outline-none px-3 py-2 rounded-md"
        placeholder="Enter new filename"
        on:keydown={(e) => e.key === 'Enter' && handleRename()}
        autofocus
      />
      {#if extension}
        <span class="text-mute font-mono text-body-sm bg-hairline-soft px-3 py-2 rounded-md border border-hairline select-none">{extension}</span>
      {/if}
    </div>
    
    <div class="flex justify-end gap-3">
      <button class="btn-ghost text-mute hover:text-ink px-4 py-2 rounded-md" on:click={onCancel}>Cancel</button>
      <button class="btn-primary px-4 py-2 rounded-md" on:click={handleRename} disabled={!newName.trim()}>Rename</button>
    </div>
  </div>
</div>
