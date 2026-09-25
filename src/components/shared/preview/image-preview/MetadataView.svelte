<script lang="ts">
  import type { FileEntry } from '../../../lib/file-utils';

  export let file: FileEntry;
  export let mimeType: string;

  function formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(1)} GB`;
  }
</script>

<div class="p-6 bg-canvas w-full h-[60vh] min-h-[300px] overflow-y-auto border-t border-hairline">
  <h3 class="text-heading-sm font-semibold text-ink mb-6">File Metadata</h3>
  
  <div class="flex flex-col gap-1 max-w-2xl mx-auto bg-canvas-elevated border border-hairline rounded-lg overflow-hidden">
    <div class="flex justify-between p-3 border-b border-hairline-soft">
      <span class="text-mute text-body-sm font-medium">Filename</span>
      <span class="text-ink text-body-sm font-mono text-right break-all ml-4">{file.filename.split('/').pop()}</span>
    </div>
    <div class="flex justify-between p-3 border-b border-hairline-soft">
      <span class="text-mute text-body-sm font-medium">Path</span>
      <span class="text-ink text-body-sm font-mono text-right break-all ml-4">{file.filename}</span>
    </div>
    <div class="flex justify-between p-3 border-b border-hairline-soft">
      <span class="text-mute text-body-sm font-medium">File Size</span>
      <span class="text-ink text-body-sm font-mono ml-4">{formatSize(file.uncompressedSize)}</span>
    </div>
    <div class="flex justify-between p-3 border-b border-hairline-soft">
      <span class="text-mute text-body-sm font-medium">Compressed Size</span>
      <span class="text-ink text-body-sm font-mono ml-4">{formatSize(file.compressedSize)}</span>
    </div>
    <div class="flex justify-between p-3 border-b border-hairline-soft">
      <span class="text-mute text-body-sm font-medium">Type</span>
      <span class="text-ink text-body-sm font-mono ml-4">{mimeType || 'Unknown'}</span>
    </div>
    <div class="flex justify-between p-3">
      <span class="text-mute text-body-sm font-medium">Last Modified</span>
      <span class="text-ink text-body-sm font-mono ml-4">{new Date(file.lastModDate).toLocaleString()}</span>
    </div>
  </div>
</div>
