<script lang="ts">
  import { onMount } from 'svelte';
  import { zoomPan, type TransformState } from './gestures';

  export let content: ArrayBuffer;
  export let alt: string = '';
  
  export let transform: TransformState;
  export let onTransform: (t: TransformState) => void;

  let container: HTMLDivElement;
  let canvasElement: HTMLCanvasElement;
  let loading = true;
  let errorMsg = '';
  let imgWidth = 0;
  let imgHeight = 0;

  export function fitToScreen() {
    if (!canvasElement || !container || imgWidth === 0) return;
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;

    const scaleX = cWidth / imgWidth;
    const scaleY = cHeight / imgHeight;
    let scale = Math.min(scaleX, scaleY);
    if (scale > 1) scale = 1;

    onTransform({ x: 0, y: 0, scale });
  }

  export function actualSize() {
    onTransform({ x: 0, y: 0, scale: 1 });
  }

  export function getCanvas() {
    return canvasElement;
  }

  onMount(async () => {
    try {
      // Lazy load ag-psd
      const { readPsd } = await import('ag-psd');
      const psd = readPsd(content);
      imgWidth = psd.width;
      imgHeight = psd.height;
      
      canvasElement.width = psd.width;
      canvasElement.height = psd.height;
      if (psd.canvas) {
        const ctx = canvasElement.getContext('2d');
        ctx?.drawImage(psd.canvas, 0, 0);
      }
      loading = false;
      setTimeout(() => fitToScreen(), 10);
    } catch (err) {
      loading = false;
      errorMsg = err instanceof Error ? err.message : 'Failed to decode PSD';
    }
  });

  function handleDoubleClick() {
    if (transform.scale === 1) {
      fitToScreen();
    } else {
      actualSize();
    }
  }
</script>

<div 
  class="relative w-full flex-1 h-full min-h-[300px] overflow-hidden bg-hairline-soft/30 flex items-center justify-center touch-none select-none"
  bind:this={container}
  use:zoomPan={{ transform, onTransform }}
  on:dblclick={handleDoubleClick}
>
  {#if loading}
    <div class="flex flex-col items-center justify-center text-mute text-body-sm gap-3 w-full max-w-xs px-6">
      <div class="w-full h-1 bg-hairline rounded-full overflow-hidden relative">
        <div class="absolute inset-y-0 left-0 bg-link w-1/3 rounded-full animate-bounce" style="animation: indeterminate-progress 1.5s infinite linear;"></div>
      </div>
      <span>Decoding PSD...</span>
      <style>
        @keyframes indeterminate-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      </style>
    </div>
  {:else if errorMsg}
    <div class="text-error text-body-sm">{errorMsg}</div>
  {/if}
  
  <canvas 
    bind:this={canvasElement}
    draggable="false"
    class="max-w-none origin-center will-change-transform {loading || errorMsg ? 'hidden' : 'block'}"
    style="transform: translate({transform.x}px, {transform.y}px) scale({transform.scale});"
    {alt}
  ></canvas>
</div>
