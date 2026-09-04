// Web Worker for ZIP extraction using zip.js
import { configure, ZipReader, BlobReader, BlobWriter, TextWriter, Data64URIWriter } from '@zip.js/zip.js';

configure({
  workerScripts: {
    deflate: [],
    inflation: [],
  },
  useWebWorkers: false,
});

interface FileEntry {
  filename: string;
  isDirectory: boolean;
  uncompressedSize: number;
  compressedSize: number;
  lastModDate: Date;
  path: string[];
  depth: number;
}

interface ExtractProgress {
  type: 'progress';
  loaded: number;
  total: number;
  currentFile: string;
  fileIndex: number;
  totalFiles: number;
}

interface ExtractComplete {
  type: 'complete';
  files: FileEntry[];
  totalSize: number;
}

interface ExtractError {
  type: 'error';
  message: string;
}

interface FileContentRequest {
  type: 'getContent';
  fileIndex: number;
}

interface FileContentResponse {
  type: 'fileContent';
  fileIndex: number;
  content: string | ArrayBuffer;
  mimeType: string;
  filename: string;
}

type WorkerMessage = ExtractProgress | ExtractComplete | ExtractError | FileContentResponse;

let zipReader: ZipReader<BlobReader> | null = null;
let entries: any[] = [];

self.onmessage = async (event) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'extract': {
        const { file } = data;
        const blobReader = new BlobReader(file);
        zipReader = new ZipReader(blobReader);
        entries = await zipReader.getEntries();

        const fileEntries: FileEntry[] = [];
        let totalSize = 0;

        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const path = entry.filename.split('/').filter(Boolean);
          const isDirectory = entry.directory;
          const depth = path.length - (isDirectory ? 1 : 0);

          fileEntries.push({
            filename: path[path.length - 1] || entry.filename,
            isDirectory,
            uncompressedSize: entry.uncompressedSize,
            compressedSize: entry.compressedSize,
            lastModDate: entry.lastModDate,
            path,
            depth,
          });

          totalSize += entry.uncompressedSize;

          // Send progress for file tree building
          self.postMessage({
            type: 'progress',
            loaded: i + 1,
            total: entries.length,
            currentFile: entry.filename,
            fileIndex: i,
            totalFiles: entries.length,
          } as ExtractProgress);
        }

        self.postMessage({
          type: 'complete',
          files: fileEntries,
          totalSize,
        } as ExtractComplete);
        break;
      }

      case 'getContent': {
        const { fileIndex } = data;
        if (!zipReader || fileIndex >= entries.length) {
          throw new Error('Invalid file index');
        }

        const entry = entries[fileIndex];
        const filename = entry.filename;
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const mimeType = getMimeType(ext);

        let content: string | ArrayBuffer;
        let responseMimeType = mimeType;

        if (isTextFile(ext)) {
          const writer = new TextWriter();
          content = await entry.getData(writer);
          responseMimeType = 'text/plain; charset=utf-8';
        } else if (isImageFile(ext) || isVideoFile(ext) || isAudioFile(ext) || ext === 'pdf') {
          const writer = new Data64URIWriter(mimeType);
          content = await entry.getData(writer);
        } else {
          const writer = new BlobWriter(mimeType);
          content = await entry.getData(writer);
        }

        self.postMessage({
          type: 'fileContent',
          fileIndex,
          content,
          mimeType: responseMimeType,
          filename,
        } as FileContentResponse);
        break;
      }

      case 'downloadAll': {
        const { fileIndices } = data;
        if (!zipReader) throw new Error('No ZIP loaded');

        const zipWriter = new ZipWriter(new BlobWriter('application/zip'));
        
        for (const index of fileIndices) {
          const entry = entries[index];
          const writer = new BlobWriter();
          const blob = await entry.getData(writer);
          await zipWriter.add(entry.filename, new BlobReader(blob));
        }

        const blob = await zipWriter.close();
        const url = URL.createObjectURL(blob);
        
        self.postMessage({
          type: 'downloadReady',
          url,
          filename: 'extracted-files.zip',
        });
        break;
      }

      case 'close': {
        if (zipReader) {
          await zipReader.close();
          zipReader = null;
          entries = [];
        }
        break;
      }
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ExtractError);
  }
};

function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
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
    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    // Text/Code
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
    // Documents
    pdf: 'application/pdf',
    // Archives (nested)
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function isTextFile(ext: string): boolean {
  const textExts = new Set([
    'txt', 'md', 'json', 'xml', 'csv', 'html', 'htm', 'css',
    'js', 'ts', 'jsx', 'tsx', 'php', 'py', 'java', 'c', 'cpp',
    'cc', 'h', 'hpp', 'go', 'rs', 'yaml', 'yml', 'ini', 'log',
    'sh', 'bash', 'zsh', 'fish', 'toml', 'ini', 'cfg', 'conf',
    'sql', 'graphql', 'gql', 'vue', 'svelte', 'astro', 'dart',
    'kt', 'swift', 'rb', 'pl', 'lua', 'r', 'm', 'scala', 'clj',
    'ex', 'exs', 'erl', 'hrl', 'fs', 'fsx', 'ml', 'mli',
    'txt', 'text', 'readme', 'license', 'changelog', 'contributing',
    'dockerfile', 'makefile', 'cmake', 'gradle', 'properties',
    'env', 'env.example', 'gitignore', 'gitattributes', 'editorconfig',
  ]);
  return textExts.has(ext);
}

function isImageFile(ext: string): boolean {
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif', 'ico', 'bmp', 'tiff', 'tif'].includes(ext);
}

function isVideoFile(ext: string): boolean {
  return ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext);
}

function isAudioFile(ext: string): boolean {
  return ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext);
}