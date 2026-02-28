interface ImageKitUploadResult {
  url: string;
  fileId: string;
}

type ImageKitRuntime = { env: { IMAGEKIT_PRIVATE_KEY?: string } };

function getPrivateKey(runtime: ImageKitRuntime): string {
  const privateKey = runtime.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('IMAGEKIT_PRIVATE_KEY no está configurada');
  }
  return privateKey;
}

export async function uploadToImageKit(file: File, runtime: ImageKitRuntime, folder: string = '/products'): Promise<ImageKitUploadResult> {
  const privateKey = getPrivateKey(runtime);

  const extension = file.name.split('.').pop() || 'jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', uniqueName);
  formData.append('folder', folder);

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(privateKey + ':')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al subir imagen a ImageKit: ${error}`);
  }

  const data = (await response.json()) as { url: string; fileId: string };
  return { url: data.url, fileId: data.fileId };
}

export async function deleteFromImageKit(fileId: string, runtime: ImageKitRuntime): Promise<void> {
  const privateKey = getPrivateKey(runtime);

  const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${btoa(privateKey + ':')}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Error al eliminar imagen de ImageKit: ${error}`);
  }
}
