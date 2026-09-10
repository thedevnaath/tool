<script lang="ts">
  import { onMount } from 'svelte';
  
  export let content: string;
  export let extension: string;
  export let isWrapped: boolean = false;

  let highlightedHtml: string | null = null;
  let loading = true;

  // Common language aliases for Shiki
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'jsx',
    'tsx': 'tsx',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'sql': 'sql',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'vue': 'vue',
    'svelte': 'svelte',
    'astro': 'astro',
    'toml': 'toml',
    'ini': 'ini',
    'env': 'env'
  };

  onMount(async () => {
    try {
      const { createHighlighter } = await import('shiki');
      const lang = langMap[extension] || extension;
      
      const highlighter = await createHighlighter({
        themes: ['vitesse-dark'],
        langs: [lang]
      });
      
      highlightedHtml = highlighter.codeToHtml(content, {
        lang,
        theme: 'vitesse-dark'
      });
      
      highlighter.dispose();
    } catch (e) {
      console.error('Shiki highlighting failed, falling back to plaintext.', e);
      highlightedHtml = null;
    } finally {
      loading = false;
    }
  });
</script>

<div class="w-full h-full min-h-[300px] bg-canvas overflow-auto scrollbar-thin text-body-sm relative">
  {#if loading}
    <div class="absolute inset-0 flex items-center justify-center bg-canvas/50 z-10">
      <div class="w-5 h-5 border-2 border-hairline border-t-ink rounded-full animate-spin"></div>
    </div>
  {/if}
  
  {#if highlightedHtml}
    <!-- Render the shiki HTML. The `isWrapped` class controls whether the pre inside it wraps -->
    <div class="shiki-container p-4 {isWrapped ? 'shiki-wrap' : ''}">
      {@html highlightedHtml}
    </div>
  {:else if !loading}
    <pre class="m-0 bg-transparent text-body-sm text-code font-mono p-4 leading-relaxed {isWrapped ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}"><code>{content}</code></pre>
  {/if}
</div>

<style>
  /* Shiki outputs <pre class="shiki ..."><code>...</code></pre> */
  :global(.shiki-container pre) {
    margin: 0 !important;
    background: transparent !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  }
  
  :global(.shiki-wrap pre) {
    white-space: pre-wrap !important;
    word-break: break-word !important;
  }
</style>
