/**
 * watermark.js
 * Applies the Sewing Circle logo as a watermark to the bottom-right
 * of an uploaded image using the Canvas API.
 *
 * Returns a Promise<string> — a base64 data URL of the watermarked image.
 */
import watermarkSrc from '../assets/watermark.png';

/**
 * @param {File|string} source  — File object or existing base64/URL string
 * @param {object}      options
 * @param {number}      options.opacity      — watermark opacity 0–1 (default 0.35)
 * @param {number}      options.sizeRatio    — watermark width as fraction of image width (default 0.18)
 * @param {number}      options.padding      — px from bottom-right edge (default 12)
 * @returns {Promise<string>}  base64 data URL
 */
export async function applyWatermark(source, options = {}) {
  const { opacity = 0.35, sizeRatio = 0.18, padding = 12 } = options;

  // Load the source image
  const sourceImg = await loadImage(
    source instanceof File ? await fileToDataUrl(source) : source
  );

  // Load the watermark logo
  const wmImg = await loadImage(watermarkSrc);

  // Create canvas
  const canvas  = document.createElement('canvas');
  canvas.width  = sourceImg.naturalWidth;
  canvas.height = sourceImg.naturalHeight;
  const ctx     = canvas.getContext('2d');

  // Draw source image
  ctx.drawImage(sourceImg, 0, 0);

  // Calculate watermark dimensions — proportional to image width
  const wmWidth  = Math.round(canvas.width * sizeRatio);
  const wmHeight = Math.round((wmImg.naturalHeight / wmImg.naturalWidth) * wmWidth);

  // Position: bottom-right with padding
  const x = canvas.width  - wmWidth  - padding;
  const y = canvas.height - wmHeight - padding;

  // Draw watermark with opacity
  ctx.globalAlpha = opacity;
  ctx.drawImage(wmImg, x, y, wmWidth, wmHeight);
  ctx.globalAlpha = 1.0;

  return canvas.toDataURL('image/jpeg', 0.92);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
