<script lang="ts">
  export let archiveName: string = 'archive.zip';
  export let compressionLevel: number = 6;
  export let disabled: boolean = false;
</script>

<div class="card p-6">
  <h3 class="text-heading-md font-semibold text-ink mb-4 flex items-center gap-2">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    Archive Settings
  </h3>

  <div class="space-y-6">
    <div>
      <label for="archive-name" class="block text-body-sm font-medium text-body mb-2">
        Archive Name
      </label>
      <div class="flex items-center gap-2">
        <input
          bind:value={archiveName}
          id="archive-name"
          type="text"
          class="input flex-1"
          placeholder="archive.zip"
          disabled={disabled}
          aria-describedby="archive-name-hint"
        />
        <span class="text-body-sm text-mute font-mono whitespace-nowrap">.zip</span>
      </div>
      <p id="archive-name-hint" class="text-body-sm text-mute mt-1">The downloaded file will have this name</p>
    </div>

    <div>
      <label class="block text-body-sm font-medium text-body mb-2 flex items-center justify-between">
        Compression Level
        <span class="text-body-sm text-mute font-mono">
          Level {compressionLevel} ({compressionLevel === 0 ? 'Store (no compression)' : compressionLevel <= 4 ? 'Fast' : compressionLevel <= 7 ? 'Balanced' : 'Best compression'})
        </span>
      </label>
      <div class="flex items-center gap-4">
        <input
          bind:value={compressionLevel}
          type="range"
          min="0"
          max="9"
          step="1"
          class="flex-1 h-2 bg-hairline-soft rounded-full appearance-none accent-link"
          disabled={disabled}
          aria-label="Compression level"
        />
        <div class="flex items-center gap-2 text-body-sm text-mute w-24">
          <span>0</span>
          <span class="flex-1 text-center">Store</span>
          <span>9</span>
          <span class="flex-1 text-center">Best</span>
        </div>
      </div>
      <p class="text-body-sm text-mute mt-1">
        {compressionLevel === 0 ? 'Fastest, no size reduction' : compressionLevel <= 4 ? 'Fast compression, moderate size reduction' : compressionLevel <= 7 ? 'Balanced speed and compression' : 'Best compression, slowest'}
      </p>
    </div>
  </div>
</div>