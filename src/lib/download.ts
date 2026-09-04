export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  // Clean up after a delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadUrl(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  downloadUrl(dataUrl, filename);
}

export function downloadArrayBuffer(buffer: ArrayBuffer, filename: string, mimeType: string): void {
  const blob = new Blob([buffer], { type: mimeType });
  downloadBlob(blob, filename);
}

export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, filename);
}

export async function fetchAndDownload(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    const blob = await response.blob();
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
}

export function createZipDownloadUrl(files: { name: string; data: Blob | ArrayBuffer | string; mimeType?: string }[]): Promise<string> {
  // This would be implemented in the worker
  return Promise.resolve('');
}