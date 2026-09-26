<script lang="ts">
  import { onMount } from 'svelte';
  export let onAddFiles: (files: File[]) => void = () => {};
  export let disabled: boolean = false;

  let isDragOver = false;
  let fileInput: HTMLInputElement | null = null;
  let isMac = false;

  onMount(() => {
    isMac = typeof navigator !== 'undefined' && (/Mac|iPod|iPhone|iPad/.test(navigator.platform) || /Mac/.test(navigator.userAgent));
  });

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
              const promises: Promise<void>[] = [];
              for (const entry of entries) {
                if (entry.isFile) {
                  promises.push(new Promise((res) => {
                    entry.file((file) => {
                      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
                      const newFile = new File([file], file.name, { type: file.type, lastModified: file.lastModified });
                      Object.defineProperty(newFile, 'webkitRelativePath', { value: fullPath, writable: true, configurable: true });
                      newFiles.push(newFile);
                      res();
                    });
                  }));
                } else if (entry.isDirectory) {
                  promises.push(processDirectory(entry, currentPath ? `${currentPath}/${entry.name}` : entry.name));
                }
              }
              await Promise.all(promises);
              readEntries();
            });
          };
          readEntries();
        });
      }

      const promises: Promise<void>[] = [];
      for (const item of items) {
        if (item.kind === 'file' && !item.webkitGetAsEntry) {
          const file = item.getAsFile();
          if (file) newFiles.push(file);
        } else if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isDirectory) {
              promises.push(processDirectory(entry, entry.name));
            } else if (entry.isFile) {
              promises.push(new Promise((res) => {
                entry.file((file) => {
                  newFiles.push(file);
                  res();
                });
              }));
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
    
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    
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

<svelte:window on:paste={handlePaste} />

<div 
  class="relative card overflow-hidden transition-all duration-fast
    {isDragOver ? 'border-link bg-link-soft' : 'border-hairline hover:border-mute'}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  tabindex="0"
  role="button"
  aria-label="Drop zone for files and folders"
>
  <input
    bind:this={fileInput}
    type="file"
    multiple
    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    on:change={handleFileSelect}
    aria-label="Select files and folders"
    disabled={disabled}
  />


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
        <kbd class="px-2 py-0.5 bg-hairline-soft rounded-sm text-body-sm font-mono text-body">{isMac ? '⌘' : 'Ctrl'}</kbd>
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
</div>