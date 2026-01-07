/**
 * Client-side image compression utility
 * Compresses images before upload to reduce bandwidth and upload times
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeMB?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  maxSizeMB: 1,
  quality: 0.8,
};

/**
 * Compress an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise resolving to the compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip compression for small files (under 500KB)
  if (file.size < 500 * 1024) {
    return file;
  }

  // Skip compression for non-image files
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > opts.maxWidth! || height > opts.maxHeight!) {
          const ratio = Math.min(
            opts.maxWidth! / width,
            opts.maxHeight! / height,
          );
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Use better image smoothing for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Could not compress image"));
              return;
            }

            // If compressed file is larger than original, return original
            if (blob.size >= file.size) {
              resolve(file);
              return;
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") +
                (mimeType === "image/png" ? ".png" : ".jpg"),
              {
                type: mimeType,
                lastModified: Date.now(),
              },
            );

            // If still too large, recursively compress with lower quality
            const maxSizeBytes = opts.maxSizeMB! * 1024 * 1024;
            if (compressedFile.size > maxSizeBytes && opts.quality! > 0.3) {
              compressImage(compressedFile, {
                ...opts,
                quality: opts.quality! - 0.1,
              })
                .then(resolve)
                .catch(reject);
            } else {
              resolve(compressedFile);
            }
          },
          mimeType,
          opts.quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Could not load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Could not read file"));
    };
  });
}

/**
 * Get human readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
