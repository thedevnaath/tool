<script lang="ts">
  export let content: string;
  export let isWrapped: boolean = false;
</script>

<div class="w-full h-full min-h-[300px] bg-canvas p-4 overflow-auto scrollbar-thin">
  <pre class="m-0 bg-transparent text-body-sm text-code font-mono leading-relaxed {isWrapped ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}"><code>{content}</code></pre>
</div>
