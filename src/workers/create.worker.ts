// Web Worker for ZIP creation using zip.js
import { configure, ZipWriter, BlobReader, BlobWriter } from '@zip.js/zip.js';

configure({
  workerScripts: {
    deflate: [],
    inflation: [],
  },
  useWebWorkers: false,
});

interface CreateProgress {
  type: 'progress';
  loaded: number;
  total: number;
  currentFile: string;
  fileIndex: number;
  totalFiles: number;
}

interface CreateComplete {
  type: 'complete';
  url: string;
  filename: string;
  totalSize: number;
  compressedSize: number;
}

interface CreateError {
  type: 'error';
  message: string;
}

type WorkerMessage = CreateProgress | CreateComplete | CreateError;

let files: File[] = [];

self.onmessage = async (event) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'addFiles': {
        files = data.files;
        self.postMessage({ type: 'filesAdded', count: files.length });
        break;
      }

      case 'create': {
        const { archiveName, compressionLevel } = data;
        
        const zipWriter = new ZipWriter(new BlobWriter('application/zip'));
        let totalSize = 0;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          totalSize += file.size;

          self.postMessage({
            type: 'progress',
            loaded: file.size,
            total: totalSize,
            currentFile: file.name,
            fileIndex: i,
            totalFiles: files.length,
          } as CreateProgress);

          await zipWriter.add(file.name, new BlobReader(file), {
            level: compressionLevel || 6,
          });
        }

        const blob = await zipWriter.close();
        const compressedSize = blob.size;
        const url = URL.createObjectURL(blob);

        self.postMessage({
          type: 'complete',
          url,
          filename: archiveName || 'archive.zip',
          totalSize,
          compressedSize,
        } as CreateComplete);
        break;
      }

      case 'clear': {
        files = [];
        break;
      }
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as CreateError);
  }
};