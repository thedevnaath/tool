<script lang="ts">
  import type { FileTreeNode } from '../../lib/file-utils';
  import FileTreeNode from './FileTreeNode.svelte';

  export let node: FileTreeNode;
  export let selectedIndex: number | null;
  export let onselect: (index: number) => void = () => {};
  export let depth: number = 0;

  function toggleExpanded() { node.expanded = !node.expanded; }

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    if (!node.isDirectory) { onselect(node.index!); }
    else { toggleExpanded(); }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!node.isDirectory) { onselect(node.index!); }
      else { toggleExpanded(); }
    }
    if (event.key === 'ArrowRight' && node.isDirectory && !node.expanded) toggleExpanded();
    if (event.key === 'ArrowLeft' && node.isDirectory && node.expanded) toggleExpanded();
  }

  function formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
</script>

<li
  role="treeitem"
  aria-level={depth + 1}
  aria-expanded={node.isDirectory ? node.expanded : undefined}
  aria-selected={node.index === selectedIndex}
  style="padding-left: {depth * 16}px"
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="group flex items-center gap-1.5 px-2 py-1 rounded-md text-body-sm cursor-pointer select-none transition-colors duration-fast
      {node.index === selectedIndex ? 'bg-link-soft text-link' : 'text-mute hover:text-ink hover:bg-hairline-soft'}"
    on:click={handleClick}
    on:keydown={handleKeyDown}
    tabindex="0"
    role={node.isDirectory ? 'button' : 'treeitem'}
    aria-label={node.filename}
  >
    <!-- Expand/collapse chevron for directories -->
    {#if node.isDirectory}
      <svg
        class="w-3 h-3 flex-shrink-0 transition-transform duration-fast text-faint {node.expanded ? 'rotate-90' : ''}"
        fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <!-- Folder icon -->
      <svg class="w-3.5 h-3.5 flex-shrink-0 {node.expanded ? 'text-warning' : 'text-mute'}" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      </svg>
    {:else}
      <span class="w-3 flex-shrink-0"></span>
      <!-- File icon -->
      <svg class="w-3.5 h-3.5 flex-shrink-0 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    {/if}

    <span class="flex-1 truncate min-w-0 font-mono">{node.filename}</span>

    {#if !node.isDirectory && node.uncompressedSize > 0}
      <span class="text-body-sm text-faint font-mono shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {formatSize(node.uncompressedSize)}
      </span>
    {/if}
  </div>

  {#if node.isDirectory && node.expanded && node.children.length > 0}
    <ul role="group">
      {#each node.children as child}
        <FileTreeNode node={child} selectedIndex={selectedIndex} onselect={onselect} depth={depth + 1} />
      {/each}
    </ul>
  {/if}
</li>
