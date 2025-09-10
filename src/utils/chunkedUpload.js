/**
 * Chunked Upload Utility
 * Para arquivos muito grandes, divide o upload em partes menores
 */

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export const chunkedUpload = async (file, url, options = {}) => {
  const {
    chunkSize = CHUNK_SIZE,
    onProgress = () => {},
    headers = {},
    timeout = 60000
  } = options;

  const totalChunks = Math.ceil(file.size / chunkSize);
  let uploadedBytes = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex);
    formData.append('totalChunks', totalChunks);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size);

    try {
      await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...headers,
          'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
        },
        signal: AbortSignal.timeout(timeout)
      });

      uploadedBytes += chunk.size;
      const progress = Math.round((uploadedBytes / file.size) * 100);
      onProgress(progress);

    } catch (error) {
      throw new Error(`Chunk ${chunkIndex + 1}/${totalChunks} failed: ${error.message}`);
    }
  }

  // Finalizar upload
  const finalizeResponse = await fetch(`${url}/finalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      totalChunks
    })
  });

  if (!finalizeResponse.ok) {
    throw new Error('Failed to finalize chunked upload');
  }

  return finalizeResponse.json();
};

export default chunkedUpload;
