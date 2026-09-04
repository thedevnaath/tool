<script lang="ts">
  import type { FileTreeNode } from '../../lib/file-utils';
  import FileTreeNode from './FileTreeNode.svelte';
  
  export let tree: FileTreeNode[] = $props();
  export let selectedIndex: number | null = $props();
  export let showHiddenFiles: boolean = $props(false);
  export let onselect: (index: number) => void = () => {};
  export let onToggleHidden: (value: boolean) => void = () => {};

  let searchQuery = '';

  function filterNodes(nodes: FileTreeNode[], query: string): FileTreeNode[] {
    if (!query.trim()) return nodes;
    
    const lowerQuery = query.toLowerCase();
    
    function filter(node: FileTreeNode): FileTreeNode | null {
      const matches = node.filename.toLowerCase().includes(lowerQuery);
      const filteredChildren = node.children.map(filter).filter((n): n is FileTreeNode => n !== null);
      
      if (matches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren, expanded: true };
      }
      return null;
    }
    
    return nodes.map(filter).filter((n): n is FileTreeNode => n !== null);
  }

  $: filteredTree = filterNodes(tree, searchQuery);

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
</script>

<div class="card overflow-hidden flex flex-col h-[calc(100vh-300px)] min-h-[400px] max-h-[70vh]">
  <div class="p-4 border-b border-hairline flex flex-col gap-3">
    <div class="relative">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Filter files..."
        class="input pl-10"
        aria-label="Filter files"
      />
    </div>
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        bind:checked={showHiddenFiles}
        on:change={() => onToggleHidden(showHiddenFiles)}
        class="w-4 h-4 rounded-sm border-hairline text-link focus:ring-link focus:ring-2"
        aria-label="Show hidden files"
      />
      <span class="text-body-sm text-body">Show hidden files</span>
    </label>
  </div>

  <div class="flex-1 overflow-auto scrollbar-thin p-2" role="tree" aria-label="File structure">
    {#if filteredTree.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-mute py-12">
        <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-body-md">{searchQuery ? 'No files match your search' : 'No files in archive'}</p>
      </div>
    {:else}
      <ul class="space-y-1" role="group">
        {#each filteredTree as node}
          <FileTreeNode node={node} selectedIndex={selectedIndex} onselect={onselect} depth={0} />
        {/each}
      </ul>
    {/if}
  </div>
</div>