<script lang="ts">
  import type { FileTreeNode } from '../../lib/file-utils';
  import FileTreeNode from './FileTreeNode.svelte';

  export let tree: FileTreeNode[];
  export let selectedIndex: number | null;
  export let showHiddenFiles: boolean = false;
  export let onselect: (index: number) => void = () => {};
  export let onToggleHidden: (value: boolean) => void = () => {};

  let searchQuery = '';

  function filterNodes(nodes: FileTreeNode[], query: string): FileTreeNode[] {
    if (!query.trim()) return nodes;
    const lowerQuery = query.toLowerCase();
    function filter(node: FileTreeNode): FileTreeNode | null {
      const matches = node.filename.toLowerCase().includes(lowerQuery);
      const filteredChildren = node.children.map(filter).filter((n): n is FileTreeNode => n !== null);
      if (matches || filteredChildren.length > 0) return { ...node, children: filteredChildren, expanded: true };
      return null;
    }
    return nodes.map(filter).filter((n): n is FileTreeNode => n !== null);
  }

  $: filteredTree = filterNodes(tree, searchQuery);
</script>

<div class="flex flex-col max-h-80 overflow-hidden">
  <!-- Tree toolbar -->
  <div class="flex items-center gap-2 px-4 py-3 border-b border-hairline bg-hairline-soft/30">
    <div class="relative flex-1">
      <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Filter files..."
        class="input pl-8 py-1.5 text-body-sm h-8"
        aria-label="Filter file tree"
      />
    </div>
    <label class="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
      <input
        type="checkbox"
        bind:checked={showHiddenFiles}
        on:change={() => onToggleHidden(showHiddenFiles)}
        class="w-3.5 h-3.5"
        aria-label="Show hidden files"
      />
      <span class="text-body-sm text-mute">Hidden</span>
    </label>
  </div>

  <!-- Tree content -->
  <div class="flex-1 overflow-auto scrollbar-thin px-3 py-2" role="tree" aria-label="ZIP file structure">
    {#if filteredTree.length === 0}
      <div class="flex items-center justify-center py-8 text-mute">
        <p class="text-body-sm">{searchQuery ? 'No files match' : 'Empty archive'}</p>
      </div>
    {:else}
      <ul class="space-y-0.5" role="group">
        {#each filteredTree as node}
          <FileTreeNode node={node} selectedIndex={selectedIndex} onselect={onselect} depth={0} />
        {/each}
      </ul>
    {/if}
  </div>
</div>
