<script lang="ts">
  export let id: number;
  export let message: string;
  export let type: 'success' | 'error' | 'info' = 'info';
  export let onDismiss: (id: number) => void = () => {};

  let typeClass = '';
  if (type === 'success') typeClass = 'toast-success';
  else if (type === 'error') typeClass = 'toast-error';
  else typeClass = 'toast-info';
</script>

<div 
  class="{typeClass}"
  role="alert"
  aria-live="polite"
>
  <span class="flex-1 text-body-md">{message}</span>
  <button
    class="p-1 rounded-sm hover:bg-hairline-soft transition-colors text-ink opacity-60 hover:opacity-100"
    on:click={() => onDismiss(id)}
    aria-label="Dismiss"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>