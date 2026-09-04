<script lang="ts">
  export let files: File[] = $props();
  export let onAddFiles: (files: File[]) => void = () => {};
  export let onRemoveFile: (index: number) => void = () => {};
  export let onClearAll: () => void = () => {};
  export let disabled: boolean = $props(false);

  let isDragOver = false;
  let fileInput: HTMLInputElement | null = null;

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) isDragOver = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = false;
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = false;
    
    if (disabled) return;
    
    const items = event.dataTransfer?.items;
    if (items) {
      const newFiles: File[] = [];
      
      async function processItem(item: DataTransferItem, path = '') {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            const fullPath = path ? `${path}/${file.name}` : file.name;
            Object.defineProperty(file, 'webkitRelativePath', { value: fullPath, writable: false });
            newFiles.push(file);
          }
        } else if (item.kind === 'file' && item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry && entry.isDirectory) {
            const reader = entry.createReader();
            const readEntries = () => {
              reader.readEntries(async (entries) => {
                for (const entry of entries) {
                  if (entry.isFile) {
                    entry.file((file) => {
                      const fullPath = path ? `${path}/${entry.name}/${file.name}` : `${entry.name}/${file.name}`;
                      Object.defineProperty(file, 'webkitRelativePath', { value: fullPath, writable: false });
                      newFiles.push(file);
                    });
                  } else if (entry.isDirectory) {
                    await processDirectory(entry, path ? `${path}/${entry.name}` : entry.name);
                  }
                }
                readEntries();
              });
            };
            readEntries();
          }
        }
      }

      async function processDirectory(entry: FileSystemDirectoryEntry, currentPath: string) {
        const reader = entry.createReader();
        return new Promise<void>((resolve) => {
          const readEntries = () => {
            reader.readEntries(async (entries) => {
              if (entries.length === 0) {
                resolve();
                return;
              }
              for (const entry of entries) {
                if (entry.isFile) {
                  entry.file((file) => {
                    const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
                    Object.defineProperty(file, 'webkitRelativePath', { value: fullPath, writable: false });
                    newFiles.push(file);
                  });
                } else if (entry.isDirectory) {
                  await processDirectory(entry, currentPath ? `${currentPath}/${entry.name}` : entry.name);
                }
              }
              readEntries();
            });
          };
          readEntries();
        });
      }

      const promises: Promise<void>[] = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) newFiles.push(file);
        } else if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isDirectory) {
              promises.push(processDirectory(entry, entry.name));
            } else if (entry.isFile) {
              entry.file((file) => newFiles.push(file));
            }
          }
        }
      }

      await Promise.all(promises);
      
      if (newFiles.length > 0) {
        onAddFiles(newFiles);
      }
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      onAddFiles(Array.from(input.files));
      input.value = '';
    }
  }

  function handlePaste(event: ClipboardEvent) {
    if (disabled) return;
    
    const items = event.clipboardData?.items;
    if (items) {
      const newFiles: File[] = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) newFiles.push(file);
        }
      }
      if (newFiles.length > 0) {
        onAddFiles(newFiles);
      }
    }
  }

  function getDisplayName(file: File): string {
    return (file as any).webkitRelativePath || file.name;
  }

  function getFileInfo(file: File): { isDirectory: boolean; path: string } {
    const relativePath = (file as any).webkitRelativePath;
    if (relativePath) {
      const parts = relativePath.split('/');
      return {
        isDirectory: parts.length > 1,
        path: parts.slice(0, -1).join('/') + '/'
      };
    }
    return { isDirectory: false, path: 'Root' };
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
</script>

<div 
  class="relative card overflow-hidden transition-all duration-fast
    {isDragOver ? 'border-link bg-link-soft' : 'border-hairline hover:border-mute'}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:paste={handlePaste}
  tabindex="0"
  role="button"
  aria-label="Drop zone for files and folders"
>
  <input
    bind:this={fileInput}
    type="file"
    multiple
    webkitdirectory
    directory
    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    on:change={handleFileSelect}
    aria-label="Select files and folders"
    disabled={disabled}
  />

  {#if files.length === 0}
    <div class="p-8 sm:p-12 text-center">
      <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-hairline-soft text-ink
        {isDragOver ? 'bg-link-soft text-link' : ''} transition-colors">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>

      <div class="space-y-2">
        <h3 class="text-heading-md font-semibold text-ink">Drop files and folders here</h3>
        <p class="text-body-md text-body">or click to browse</p>
      </div>

      <p class="text-body-sm text-mute flex items-center justify-center gap-1.5 mt-4">
        <kbd class="px-2 py-0.5 bg-hairline-soft rounded-sm text-body-sm font-mono text-body">Ctrl</kbd>
        <span>+</span>
        <kbd class="px-2 py-0.5 bg-hairline-soft rounded-sm text-body-sm font-mono text-body">V</kbd>
        <span>to paste from clipboard</span>
      </p>

      <div class="flex items-center justify-center gap-4 text-body-sm text-mute mt-4 pt-4 border-t border-hairline">
        <span class="flex items-center gap-1.5">Any file type</span>
        <span class="flex items-center gap-1.5">Folders supported</span>
        <span class="flex items-center gap-1.5">No size limit</span>
      </div>
    </div>
  {:else}
    <div class="p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-heading-md font-semibold text-ink">{files.length} file{files.length !== 1 ? 's' : ''} ready</h3>
        <button
          class="btn-ghost text-body-sm"
          on:click={onClearAll}
          disabled={disabled}
          aria-label="Clear all files"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear all
        </button>
      </div>

      <div class="max-h-64 overflow-auto scrollbar-thin space-y-2" role="list" aria-label="Files to archive">
        {#each files as file, index}
          <div class="flex items-center gap-3 p-3 bg-hairline-soft rounded-sm hover:bg-hairline transition-colors" role="listitem">
            <div class="flex items-center justify-center w-9 h-9 rounded-sm bg-canvas-elevated text-ink flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-body-md font-medium text-ink truncate">{getDisplayName(file)}</p>
              <p class="text-body-sm text-mute font-mono">
                {getFileInfo(file).isDirectory ? '[DIR] ' : '[FILE] '}
                {getFileInfo(file).path}
                {file.size > 0 ? ` • ${formatFileSize(file.size)}` : ''}
              </p>
            </div>
            
            <button
              class="btn-icon p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error"
              on:click={() => onRemoveFile(index)}
              disabled={disabled}
              aria-label="Remove {getDisplayName(file)}"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>