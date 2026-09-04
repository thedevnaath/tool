<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { X, Maximize2, Download, ChevronLeft, ChevronRight } from 'lucide-svelte';
  
  export let content: string | ArrayBuffer = $props();
  export let mimeType: string = $props();
  export let filename: string = $props();
  export let fileType: 'image' | 'video' | 'audio' | 'text' | 'code' | 'pdf' = $props();

  let pdfInstance: any = null;
  let currentPage = $state(1);
  let totalPages = $state(0);
  let videoElement: HTMLVideoElement | null = null;
  let audioElement: HTMLAudioElement | null = null;
  let objectUrl: string | null = null;

  function getObjectUrl(): string {
    if (objectUrl) return objectUrl;
    
    if (typeof content === 'string') {
      if (content.startsWith('data:')) {
        return content;
      }
      objectUrl = URL.createObjectURL(new Blob([content], { type: mimeType || 'text/plain' }));
    } else {
      objectUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
    }
    return objectUrl;
  }

  function cleanup() {
    if (objectUrl && !objectUrl.startsWith('data:')) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
    if (pdfInstance) {
      pdfInstance.destroy();
      pdfInstance = null;
    }
  }

  onMount(() => {
    if (fileType === 'pdf') {
      loadPdf();
    }
  });

  onDestroy(() => {
    cleanup();
    if (videoElement) {
      videoElement.pause();
      videoElement.src = '';
    }
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
  });

  async function loadPdf() {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      
      let data: Uint8Array;
      if (typeof content === 'string') {
        if (content.startsWith('data:')) {
          const base64 = content.split(',')[1];
          data = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        } else {
          data = new TextEncoder().encode(content);
        }
      } else {
        data = new Uint8Array(content);
      }
      
      pdfInstance = await pdfjsLib.getDocument({ data }).promise;
      totalPages = pdfInstance.numPages;
      renderPage(currentPage);
    } catch (error) {
      console.error('PDF load error:', error);
    }
  }

  async function renderPage(pageNum: number) {
    if (!pdfInstance) return;
    const page = await pdfInstance.getPage(pageNum);
    const canvas = document.getElementById(`pdf-canvas-${pageNum}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const context = canvas.getContext('2d')!;
    await page.render({ canvasContext: context, viewport }).promise;
  }

  function goToPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= totalPages) {
      currentPage = pageNum;
      renderPage(pageNum);
    }
  }

  function handleDownload() {
    const url = getObjectUrl();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  function openInNewTab() {
    const url = getObjectUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  }
</script>

<div class="w-full" role="region" aria-label="File preview">
  <div class="flex items-center justify-between p-3 border-b border-hairline bg-canvas-elevated">
    <div class="flex items-center gap-2">
      <span class="text-body-sm text-body font-mono truncate max-w-[200px]">{filename}</span>
      <span class="px-2 py-0.5 text-body-sm bg-hairline-soft text-mute rounded-sm font-mono">{mimeType}</span>
    </div>
    <div class="flex items-center gap-1">
      <button class="btn-icon p-1.5" on:click={handleDownload} aria-label="Download">
        <Download class="w-4 h-4" aria-hidden="true" />
      </button>
      <button class="btn-icon p-1.5" on:click={openInNewTab} aria-label="Open in new tab">
        <Maximize2 class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </div>

  <div class="p-4 bg-hairline-soft min-h-[200px] max-h-[60vh] overflow-auto">
    {#if fileType === 'image'}
      <div class="flex items-center justify-center min-h-[200px]">
        <img 
          src={getObjectUrl()} 
          alt={`Preview of ${filename}`}
          class="max-w-full max-h-[60vh] object-contain rounded-md shadow-sm"
          loading="lazy"
        />
      </div>

    {:else if fileType === 'video'}
      <div class="flex items-center justify-center min-h-[200px]">
        <video
          bind:this={videoElement}
          src={getObjectUrl()}
          controls
          class="max-w-full max-h-[60vh] rounded-md shadow-sm"
          preload="metadata"
          playsinline
        ></video>
      </div>

    {:else if fileType === 'audio'}
      <div class="flex items-center justify-center min-h-[100px]">
        <audio
          bind:this={audioElement}
          src={getObjectUrl()}
          controls
          class="w-full max-w-md"
          preload="metadata"
        ></audio>
      </div>

    {:else if fileType === 'pdf'}
      <div class="flex flex-col items-center gap-4">
        {#if pdfInstance}
          <div class="w-full max-w-2xl">
            <canvas id="pdf-canvas-{currentPage}" class="w-full shadow-sm bg-white rounded-md"></canvas>
          </div>
          
          {#if totalPages > 1}
            <div class="flex items-center gap-2">
              <button 
                class="btn-icon p-1.5" 
                on:click={() => goToPage(currentPage - 1)} 
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft class="w-4 h-4" aria-hidden="true" />
              </button>
              <span class="text-body-md font-mono text-ink px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                class="btn-icon p-1.5" 
                on:click={() => goToPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          {/if}
        {:else}
          <div class="flex items-center justify-center py-12 text-mute">
            Loading PDF...
          </div>
        {/if}
      </div>

    {:else if fileType === 'text' || fileType === 'code'}
      <div class="w-full">
        <pre class="bg-canvas-elevated rounded-md p-4 overflow-auto max-h-[60vh] font-mono text-body-md text-ink">
          <code class="whitespace-pre-wrap break-words">{typeof content === 'string' ? content : new TextDecoder().decode(content)}</code>
        </pre>
      </div>

    {:else}
      <div class="flex flex-col items-center gap-4 py-12 text-center text-mute">
        <svg class="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p class="text-body-md">Preview not available</p>
        <button class="btn-secondary" on:click={handleDownload}>Download to view</button>
      </div>
    {/if}
  </div>
</div>