<script lang="ts">
  import type { FileTreeNode } from '../../lib/file-utils';
  import FileTreeNode from './FileTreeNode.svelte';
  
  export let node: FileTreeNode;
  export let selectedIndex: number | null;
  export let onselect: (index: number) => void = () => {};
  export let depth: number = 0;

  function toggleExpanded(node: FileTreeNode) {
    node.expanded = !node.expanded;
  }

  function handleClick(node: FileTreeNode, event: MouseEvent) {
    event.stopPropagation();
    if (!node.isDirectory) {
      onselect(node.index!);
    } else {
      toggleExpanded(node);
    }
  }

  function handleKeyDown(node: FileTreeNode, event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!node.isDirectory) {
          onselect(node.index!);
        } else {
          toggleExpanded(node);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (node.isDirectory && !node.expanded) {
          toggleExpanded(node);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (node.isDirectory && node.expanded) {
          toggleExpanded(node);
        }
        break;
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
</script>

<li class="file-tree-item" role="treeitem" aria-level={depth + 1} aria-expanded={node.isDirectory ? node.expanded : undefined} aria-selected={node.index === selectedIndex}>
  <div
    class="flex items-center gap-2 px-2 py-1.5 rounded-sm text-body-md transition-colors duration-fast
      {node.index === selectedIndex ? 'bg-link-soft text-link' : 'hover:bg-hairline-soft'}
      {node.isDirectory ? 'cursor-pointer' : 'cursor-default'}"
    on:click={(e) => handleClick(node, e)}
    on:keydown={(e) => handleKeyDown(node, e)}
    tabindex="0"
    role={node.isDirectory ? 'button' : 'treeitem'}
    aria-label={node.filename}
  >
    <span class="flex-1 flex items-center gap-1.5 min-w-0">
      {#if node.isDirectory}
        <button
          class="flex items-center justify-center w-5 h-5 rounded-sm hover:bg-hairline transition-colors"
          on:click={(e) => { e.stopPropagation(); toggleExpanded(node); }}
          aria-label={node.expanded ? 'Collapse' : 'Expand'}
          aria-expanded={node.expanded}
        >
          {#if node.expanded}
            <svg class="w-3.5 h-3.5 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          {:else}
            <svg class="w-3.5 h-3.5 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          {/if}
        </button>
      {:else}
        <span class="w-5 flex items-center justify-center" aria-hidden="true">
          <svg class="w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </span>
      {/if}
      
      <span class="truncate min-w-0">{node.filename}</span>
      
      {!node.isDirectory && node.uncompressedSize > 0}
        <span class="text-body-sm text-faint font-mono whitespace-nowrap ml-auto">
          {formatFileSize(node.uncompressedSize)}
        </span>
    </span>
  </div>

  {#if node.isDirectory && node.expanded && node.children.length > 0}
    <ul class="space-y-1" role="group">
      {#each node.children as child}
        <FileTreeNode node={child} selectedIndex={selectedIndex} onselect={onselect} depth={depth + 1} />
      {/each}
    </ul>
  {/if}
</li>