// src/lib/imageCompressor.ts
import imageCompression from 'browser-image-compression';

export async function compressEquipmentPhoto(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.08,          // Maksimal 80 KB per foto!
    maxWidthOrHeight: 800,    // Cukup tajam untuk layar HP
    useWebWorker: true,
    fileType: 'image/webp',   // Format paling ringan & cepat
  };
  return await imageCompression(file, options);
}
