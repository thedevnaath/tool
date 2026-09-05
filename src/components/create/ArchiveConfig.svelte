<script lang="ts">
  export let archiveName: string = 'archive.zip';
  export let compressionLevel: number = 6;
  export let disabled: boolean = false;

  $: levelLabel = compressionLevel === 0 ? 'No compression (fastest)'
    : compressionLevel <= 3 ? 'Fast'
    : compressionLevel <= 6 ? 'Balanced'
    : 'Best compression (slowest)';
</script>

<div class="card p-5 space-y-5">
  <h3 class="text-heading-sm font-semibold text-ink flex items-center gap-2">
    <svg class="w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    Archive Settings
  </h3>

  <div class="space-y-4">
    <!-- Archive name -->
    <div>
      <label for="archive-name" class="block text-body-sm font-medium text-body mb-1.5">Archive name</label>
      <div class="flex items-center gap-2">
        <input
          bind:value={archiveName}
          id="archive-name"
          type="text"
          class="input flex-1"
          placeholder="archive"
          disabled={disabled}
          aria-describedby="archive-name-hint"
        />
        <span class="text-body-sm text-faint font-mono whitespace-nowrap">.zip</span>
      </div>
      <p id="archive-name-hint" class="text-body-sm text-faint mt-1">The file will download with this name</p>
    </div>

    <!-- Compression level -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label for="compression-level" class="text-body-sm font-medium text-body">Compression</label>
        <span class="text-body-sm text-mute font-mono">Level {compressionLevel} — {levelLabel}</span>
      </div>
      <input
        bind:value={compressionLevel}
        id="compression-level"
        type="range"
        min="0"
        max="9"
        step="1"
        class="w-full h-1.5 bg-hairline rounded-full appearance-none cursor-pointer accent-link"
        disabled={disabled}
        aria-label="Compression level: {compressionLevel}"
      />
      <div class="flex justify-between text-body-sm text-faint mt-1 font-mono">
        <span>0 Fastest</span>
        <span>9 Smallest</span>
      </div>
    </div>
  </div>
</div>
