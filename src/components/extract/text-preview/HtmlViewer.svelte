<script lang="ts">
  export let content: string;
  let isLoaded = false;
</script>

<div class="w-full h-full min-h-[300px] bg-white overflow-hidden relative rounded-b-md">
  {#if !isLoaded}
    <div class="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 space-y-4">
      <div class="text-sm text-gray-500 font-medium">Rendering HTML Preview...</div>
      <div class="w-1/2 max-w-sm h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
        <div class="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full animate-progress"></div>
      </div>
    </div>
  {/if}
  <iframe 
    title="HTML Preview"
    class="w-full h-full border-none {isLoaded ? 'opacity-100' : 'opacity-0'}"
    sandbox="" 
    srcdoc={content}
    on:load={() => { isLoaded = true; }}
  ></iframe>
</div>

<style>
  @keyframes progress {
    0% { left: -40%; width: 40%; }
    50% { left: 20%; width: 60%; }
    100% { left: 100%; width: 40%; }
  }
  .animate-progress {
    animation: progress 1.5s infinite linear;
  }
</style>
