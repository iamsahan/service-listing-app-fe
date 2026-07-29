/**
 * Image compression utility functions
 * Compresses images before upload to reduce file size and improve upload performance
 */

/**
 * Compress an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    // Default compression settings
    const settings = {
      maxWidth: options.maxWidth || 1920,
      maxHeight: options.maxHeight || 1080,
      quality: options.quality || 0.8, // 80% quality
      format: options.format || "image/jpeg",
      maxSizeInMB: options.maxSizeInMB || 1, // Target max size 1MB
      ...options,
    };

    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    if (file.size <= settings.maxSizeInMB * 1024 * 1024) {
      resolve(file);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > settings.maxWidth || height > settings.maxHeight) {
          const ratio = Math.min(
            settings.maxWidth / width,
            settings.maxHeight / height
          );
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        let quality = settings.quality;
        let compressedDataUrl;

        const tryCompress = (targetQuality) => {
          return new Promise((resolveCompress) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolveCompress({
                    blob,
                    size: blob.size,
                    quality: targetQuality,
                  });
                } else {
                  resolveCompress(null);
                }
              },
              settings.format,
              targetQuality
            );
          });
        };

        // Progressive compression to meet size target
        const progressiveCompress = async () => {
          let result = await tryCompress(quality);

          // If still too large, reduce quality
          while (
            result &&
            result.size > settings.maxSizeInMB * 1024 * 1024 &&
            quality > 0.1
          ) {
            quality -= 0.1;
            result = await tryCompress(quality);
          }

          if (result && result.blob) {
            const compressedFile = new File(
              [result.blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              {
                type: settings.format,
                lastModified: Date.now(),
              }
            );

            console.log(
              `Image compressed: ${(file.size / 1024 / 1024).toFixed(
                2
              )}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(
                2
              )}MB (${Math.round(
                (1 - compressedFile.size / file.size) * 100
              )}% reduction)`
            );

            resolve(compressedFile);
          } else {
            // If compression failed, return original file
            console.warn("Image compression failed, using original file");
            resolve(file);
          }
        };

        progressiveCompress();
      } catch (error) {
        console.error("Error during image compression:", error);
        resolve(file);
      }
    };

    img.onerror = () => {
      console.error("Error loading image for compression");
      resolve(file); // Return original file on error
    };

    // Load image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed image files
 */
export const compressImages = async (files, options = {}) => {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Get optimal compression settings based on file size
 * @param {number} fileSize - File size in bytes
 * @returns {Object} - Optimal compression settings
 */
export const getOptimalCompressionSettings = (fileSize) => {
  const sizeInMB = fileSize / (1024 * 1024);

  if (sizeInMB <= 1) {
    return { quality: 0.9, maxWidth: 1920, maxHeight: 1080, maxSizeInMB: 1 };
  } else if (sizeInMB <= 3) {
    return { quality: 0.8, maxWidth: 1600, maxHeight: 900, maxSizeInMB: 0.8 };
  } else if (sizeInMB <= 5) {
    return { quality: 0.7, maxWidth: 1400, maxHeight: 800, maxSizeInMB: 0.6 };
  } else {
    return { quality: 0.6, maxWidth: 1200, maxHeight: 700, maxSizeInMB: 0.5 };
  }
};

/**
 * Batch process and compress form documents
 * @param {Object} documents - Document object with file fields
 * @returns {Promise<Object>} - Compressed documents object
 */
export const compressFormDocuments = async (documents) => {
  const compressedDocuments = { ...documents };

  for (const [key, file] of Object.entries(documents)) {
    if (file && file instanceof File && file.type.startsWith("image/")) {
      try {
        const compressionSettings = getOptimalCompressionSettings(file.size);
        compressedDocuments[key] = await compressImage(
          file,
          compressionSettings
        );
      } catch (error) {
        console.error(`Error compressing ${key}:`, error);
        // Keep original file if compression fails
        compressedDocuments[key] = file;
      }
    }
  }

  return compressedDocuments;
};
