<script lang="ts">
  interface ProgressData {
    loaded: number;
    total: number;
    currentFile: string;
    fileIndex: number;
    totalFiles: number;
  }
  export let progress: ProgressData;

  $: pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;
</script>

<div class="card p-5 animate-slide-up" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label="ZIP creation progress {pct}%">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-8 h-8 border-2 border-hairline border-t-ink rounded-full animate-spin flex-shrink-0" aria-hidden="true"></div>
    <div>
      <h3 class="text-body-md font-semibold text-ink">Creating archive...</h3>
      <p class="text-body-sm text-mute">{progress.fileIndex} of {progress.totalFiles} files</p>
    </div>
    <span class="ml-auto font-mono text-body-sm text-mute">{pct}%</span>
  </div>

  <div class="progress-track mb-2">
    <div class="progress-bar" style="width: {pct}%"></div>
  </div>

  {#if progress.currentFile}
    <p class="text-body-sm text-faint font-mono truncate">{progress.currentFile}</p>
  {/if}
</div>
