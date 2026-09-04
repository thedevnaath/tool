export interface FileEntry {
  filename: string;
  isDirectory: boolean;
  uncompressedSize: number;
  compressedSize: number;
  lastModDate: Date;
  path: string[];
  depth: number;
  index?: number;
  children?: FileEntry[];
  parent?: FileEntry;
  expanded?: boolean;
}

export interface FileTreeNode extends FileEntry {
  children: FileTreeNode[];
}

export function buildFileTree(files: FileEntry[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const pathMap = new Map<string, FileTreeNode>();

  // Sort files by path to ensure parents come before children
  const sortedFiles = [...files].sort((a, b) => {
    const aPath = a.path.join('/');
    const bPath = b.path.join('/');
    return aPath.localeCompare(bPath);
  });

  for (const file of sortedFiles) {
    const node: FileTreeNode = {
      ...file,
      children: [],
      expanded: file.depth === 0, // Expand root level by default
    };

    if (file.depth === 0) {
      root.push(node);
      pathMap.set(file.filename, node);
    } else {
      const parentPath = file.path.slice(0, -1).join('/');
      const parent = pathMap.get(parentPath);
      if (parent) {
        node.parent = parent;
        parent.children.push(node);
        pathMap.set(file.path.join('/'), node);
      } else {
        // Orphaned node, add to root
        root.push(node);
        pathMap.set(file.path.join('/'), node);
      }
    }
  }

  return root;
}

export function flattenTree(tree: FileTreeNode[]): FileTreeNode[] {
  const result: FileTreeNode[] = [];
  
  function traverse(nodes: FileTreeNode[]) {
    for (const node of nodes) {
      result.push(node);
      if (node.expanded && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  
  traverse(tree);
  return result;
}

export function findNodeByIndex(tree: FileTreeNode[], index: number): FileTreeNode | null {
  for (const node of tree) {
    if (node.index === index) return node;
    if (node.children.length > 0) {
      const found = findNodeByIndex(node.children, index);
      if (found) return found;
    }
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function getFileType(filename: string): 'image' | 'video' | 'audio' | 'text' | 'pdf' | 'archive' | 'code' | 'other' {
  const ext = getFileExtension(filename);
  
  const imageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'ico', 'bmp', 'tiff', 'tif'];
  const videoExts = ['mp4', 'webm', 'mov', 'mkv', 'avi'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
  const textExts = ['txt', 'md', 'log', 'csv', 'yaml', 'yml', 'ini', 'cfg', 'conf'];
  const codeExts = [
    'js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less',
    'json', 'xml', 'php', 'py', 'java', 'c', 'cpp', 'cc', 'h', 'hpp',
    'go', 'rs', 'vue', 'svelte', 'astro', 'dart', 'kt', 'swift', 'rb',
    'pl', 'lua', 'r', 'm', 'scala', 'clj', 'ex', 'exs', 'erl', 'hrl',
    'fs', 'fsx', 'ml', 'mli', 'sql', 'graphql', 'gql', 'sh', 'bash',
    'zsh', 'fish', 'toml', 'dockerfile', 'makefile', 'cmake', 'gradle',
    'properties', 'env', 'gitignore', 'gitattributes', 'editorconfig'
  ];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz', 'tbz2', 'txz'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (archiveExts.includes(ext)) return 'archive';
  if (codeExts.includes(ext)) return 'code';
  if (textExts.includes(ext)) return 'text';
  return 'other';
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    ico: 'image/x-icon',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'text/javascript',
    ts: 'text/typescript',
    jsx: 'text/javascript',
    tsx: 'text/typescript',
    php: 'text/x-php',
    py: 'text/x-python',
    java: 'text/x-java-source',
    c: 'text/x-c',
    cpp: 'text/x-c++',
    cc: 'text/x-c++',
    h: 'text/x-c',
    hpp: 'text/x-c++',
    go: 'text/x-go',
    rs: 'text/x-rust',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    ini: 'text/plain',
    log: 'text/plain',
    pdf: 'application/pdf',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export function canPreview(filename: string): boolean {
  const type = getFileType(filename);
  return ['image', 'video', 'audio', 'text', 'code', 'pdf'].includes(type);
}

export function isArchive(filename: string): boolean {
  return getFileType(filename) === 'archive';
}