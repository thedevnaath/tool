<script lang="ts">
  import { onMount } from 'svelte';
  import { zoomPan, type TransformState } from './gestures';

  export let src: string;
  export let alt: string = '';
  
  export let transform: TransformState;
  export let onTransform: (t: TransformState) => void;

  let imgElement: HTMLImageElement;
  let container: HTMLDivElement;
  
  // We track loaded state to trigger fitToScreen
  let loaded = false;

  export function fitToScreen() {
    if (!imgElement || !container || !loaded) return;
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;
    const iWidth = imgElement.naturalWidth || cWidth;
    const iHeight = imgElement.naturalHeight || cHeight;

    const scaleX = cWidth / iWidth;
    const scaleY = cHeight / iHeight;
    // Fit, with a small padding
    let scale = Math.min(scaleX, scaleY);
    // don't scale up beyond 1 if image is small
    if (scale > 1) scale = 1;

    onTransform({ x: 0, y: 0, scale });
  }

  export function actualSize() {
    onTransform({ x: 0, y: 0, scale: 1 });
  }

  function handleLoad() {
    loaded = true;
    fitToScreen();
  }

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
  <img 
    bind:this={imgElement}
    {src} 
    {alt} 
    on:load={handleLoad}
    draggable="false"
    class="max-w-none origin-center will-change-transform"
    style="transform: translate({transform.x}px, {transform.y}px) scale({transform.scale});"
  />
</div>
