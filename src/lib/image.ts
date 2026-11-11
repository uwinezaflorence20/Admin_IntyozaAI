const MAX_FILE_BYTES = 10 * 1024 * 1024;
// The backend rejects request bodies over 100 KB, so leave room for the other fields.
const MAX_DATA_URL_LENGTH = 75_000;
const SIZES = [640, 480, 320, 240];
const QUALITIES = [0.8, 0.6, 0.45];

/**
 * Turns a picked photo into a small JPEG data URL. The backend has no upload route and stores
 * the picture as text in `imageUrl`, so it has to fit inside a normal JSON request.
 */
export async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_FILE_BYTES) throw new Error("Please choose an image smaller than 10 MB.");

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This image could not be read. Please try another one.");
  });

  try {
    for (const size of SIZES) {
      const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("This browser could not process the image.");
      // JPEG has no transparency, so transparent areas become white instead of black.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITIES) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
      }
    }
  } finally {
    bitmap.close();
  }
  throw new Error("This image is too detailed to upload. Please try another one.");
}
