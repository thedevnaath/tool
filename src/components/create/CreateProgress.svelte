<script lang="ts">
  interface ProgressData {
    loaded: number;
    total: number;
    currentFile: string;
    fileIndex: number;
    totalFiles: number;
  }
  
  export let progress: ProgressData = $props();

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
</script>

<div class="card p-6 animate-slide-in" role="progressbar" aria-valuenow={progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0} aria-valuemin="0" aria-valuemax="100" aria-label="ZIP creation progress">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 rounded-full bg-link-soft flex items-center justify-center">
      <svg class="w-5 h-5 text-link animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
    <div>
      <h3 class="text-heading-md font-semibold text-ink">Creating Archive</h3>
      <p class="text-body-sm text-body">Please wait while we compress your files...</p>
    </div>
  </div>

  <div class="space-y-3">
    <div class="flex items-center justify-between gap-4">
      <span class="text-body-md text-ink font-medium">Overall Progress</span>
      <span class="text-body-sm text-mute font-mono">{progress.fileIndex} / {progress.totalFiles} files</span>
    </div>
    <div class="w-full h-3 bg-hairline-soft rounded-full overflow-hidden">
      <div 
        class="h-full bg-ink rounded-full transition-all duration-fast ease-out" 
        style="width: {progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0}%"
      ></div>
    </div>
    
    <div class="flex items-center justify-between gap-4">
      <span class="text-body-md text-ink font-medium">Current File</span>
      <span class="text-body-sm text-mute font-mono">{formatFileSize(progress.loaded)} / {formatFileSize(progress.total)}</span>
    </div>
    <div class="w-full h-3 bg-hairline-soft rounded-full overflow-hidden">
      <div 
        class="h-full bg-link rounded-full transition-all duration-fast ease-out" 
        style="width: {progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0}%"
      ></div>
    </div>
    
    <p class="text-body-sm text-mute truncate">{progress.currentFile}</p>
  </div>
</div>