<script lang="ts">
  import { onMount } from 'svelte';
  
  export let content: string;
  
  let htmlContent = '';
  let loading = true;

  onMount(async () => {
    try {
      const { marked } = await import('marked');
      const DOMPurifyModule = await import('dompurify');
      // Handle different module resolution systems (CommonJS vs ES Modules)
      const DOMPurify = DOMPurifyModule.default || DOMPurifyModule;
      
      const rawHtml = await marked.parse(content, { async: true });
      htmlContent = DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true }
      });
    } catch (e) {
      console.error('Markdown rendering failed:', e);
      htmlContent = '<p class="text-error">Failed to render markdown.</p>';
    } finally {
      loading = false;
    }
  });
</script>

<div class="w-full h-full min-h-[300px] bg-canvas p-6 overflow-auto scrollbar-thin relative text-body-md text-ink">
  {#if loading}
    <div class="absolute inset-0 flex items-center justify-center bg-canvas/50 z-10">
      <div class="w-5 h-5 border-2 border-hairline border-t-ink rounded-full animate-spin"></div>
    </div>
  {/if}
  
  <!-- Markdown typography container -->
  <div class="markdown-body max-w-[800px] mx-auto">
    {@html htmlContent}
  </div>
</div>

<style>
  :global(.markdown-body h1) { font-size: 2em; margin-bottom: 0.5em; font-weight: 600; line-height: 1.2; }
  :global(.markdown-body h2) { font-size: 1.5em; margin-bottom: 0.5em; margin-top: 1em; font-weight: 600; line-height: 1.25; }
  :global(.markdown-body h3) { font-size: 1.25em; margin-bottom: 0.5em; margin-top: 1em; font-weight: 600; }
  :global(.markdown-body p) { margin-bottom: 1em; line-height: 1.6; }
  :global(.markdown-body a) { color: var(--color-primary); text-decoration: underline; }
  :global(.markdown-body ul) { list-style-type: disc; padding-left: 2em; margin-bottom: 1em; }
  :global(.markdown-body ol) { list-style-type: decimal; padding-left: 2em; margin-bottom: 1em; }
  :global(.markdown-body li) { margin-bottom: 0.25em; }
  :global(.markdown-body code) { font-family: ui-monospace, SFMono-Regular, monospace; background: var(--color-bg-elevated); padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
  :global(.markdown-body pre) { background: var(--color-bg-elevated); padding: 1em; border-radius: 6px; overflow-x: auto; margin-bottom: 1em; border: 1px solid var(--color-border-soft); }
  :global(.markdown-body pre code) { background: transparent; padding: 0; border-radius: 0; }
  :global(.markdown-body blockquote) { border-left: 4px solid var(--color-border-soft); padding-left: 1em; margin-left: 0; color: var(--color-text-mute); }
  :global(.markdown-body table) { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
  :global(.markdown-body th), :global(.markdown-body td) { border: 1px solid var(--color-border-soft); padding: 0.5em; text-align: left; }
</style>
