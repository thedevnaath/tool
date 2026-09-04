<script lang="ts">
  export let id: number;
  export let message: string;
  export let type: 'success' | 'error' | 'info' = 'info';
  export let onDismiss: (id: number) => void = () => {};

  let typeClass = '';
  if (type === 'success') typeClass = 'border-l-4 border-green-500 bg-green-50 text-green-900';
  else if (type === 'error') typeClass = 'border-l-4 border-red-500 bg-red-50 text-red-900';
  else typeClass = 'border-l-4 border-blue-500 bg-blue-50 text-blue-900';
</script>

<div 
  class="flex items-start gap-3 px-4 py-3 rounded-md shadow-floating min-w-[300px] max-w-md {typeClass}"
  role="alert"
  aria-live="polite"
>
  <span class="flex-1 text-body-md">{message}</span>
  <button
    class="p-1 rounded-sm hover:bg-black/10 transition-colors text-current opacity-60 hover:opacity-100"
    on:click={() => onDismiss(id)}
    aria-label="Dismiss"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>