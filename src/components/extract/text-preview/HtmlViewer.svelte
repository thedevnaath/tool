<script lang="ts">
  export let content: string;
</script>

<div class="w-full h-full min-h-[300px] bg-white overflow-hidden relative rounded-b-md">
  <iframe 
    title="HTML Preview"
    class="w-full h-full border-none"
    sandbox="" 
    srcdoc={content}
  ></iframe>
</div>
