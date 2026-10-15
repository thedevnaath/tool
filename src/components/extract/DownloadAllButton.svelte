<script lang="ts">
  export let onClick: () => void = () => {};
  export let disabled: boolean = false;
  export let count: number = 0;
  export let t: (key: any) => string = (k: any) => k;
</script>

<button
  class="btn-primary flex items-center gap-2"
  on:click={onClick}
  disabled={disabled}
  aria-label="{t('ui.download_zip')} all {count} files"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  <span>{t('ui.download_zip')}{count > 0 ? ` (${count})` : ''}</span>
</button>
