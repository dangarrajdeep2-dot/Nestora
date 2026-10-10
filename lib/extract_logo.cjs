/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');

const srcPath = 'C:/Users/ahirr/.gemini/antigravity/brain/5a5085c4-b5ce-4362-8c29-fb54d64cadd3/.user_uploaded/media_1791454923310_51e5d599.jpg';

async function extract() {
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  const isOuterFrame = new Uint8Array(w * h);
  const queue = [];

  const pushPixel = (x, y) => {
    if (x >= 0 && x < w && y >= 0 && y < h) {
      const idx = y * w + x;
      if (!isOuterFrame[idx]) {
        const pIdx = idx * ch;
        const r = data[pIdx], g = data[pIdx+1], b = data[pIdx+2];
        if (r > 225 && g > 225 && b > 225) {
          isOuterFrame[idx] = 1;
          queue.push(x, y);
        }
      }
    }
  };

  for (let x = 0; x < w; x++) {
    pushPixel(x, 0);
    pushPixel(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushPixel(0, y);
    pushPixel(w - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const nIdx = ny * w + nx;
        if (!isOuterFrame[nIdx]) {
          const pIdx = nIdx * ch;
          const r = data[pIdx], g = data[pIdx+1], b = data[pIdx+2];
          if (r > 210 && g > 210 && b > 210) {
            isOuterFrame[nIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pIdx = idx * ch;
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];

      if (isOuterFrame[idx]) {
        data[pIdx + 3] = 0; // Transparent
        continue;
      }

      const isBlue = (b > r + 18 && b > g + 8 && b > 50) || (r < 55 && g < 85 && b > 70);
      const isDarkBlue = (r < 45 && g < 65 && b < 145 && (b >= r || b >= g));

      if (isBlue || isDarkBlue) {
        data[pIdx + 3] = 0; // Transparent
      }
    }
  }

  const rawTransparent = await sharp(data, {
    raw: { width: w, height: h, channels: ch }
  })
  .png()
  .toBuffer();

  // Trim excess transparent pixels
  const trimmed = await sharp(rawTransparent).trim().png().toBuffer();
  const trimmedMeta = await sharp(trimmed).metadata();

  // Create subtle dark shadow layer so white shapes are crisp on white/light tabs
  const pad = 20;
  const targetW = trimmedMeta.width + pad * 2;
  const targetH = trimmedMeta.height + pad * 2;

  // Add subtle shadow underneath for high contrast on light backgrounds
  const shadowLayer = await sharp(trimmed)
    .ensureAlpha()
    .tint({ r: 15, g: 23, b: 42 }) // slate-900 tint
    .blur(4)
    .toBuffer();

  const finalComposite = await sharp({
    create: {
      width: targetW,
      height: targetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: shadowLayer, top: pad + 2, left: pad, blend: 'over' },
    { input: trimmed, top: pad, left: pad, blend: 'over' }
  ])
  .png()
  .toBuffer();

  // Save 512x512 logo
  await sharp(finalComposite)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/logo.png'));

  // Save 64x64 favicon
  await sharp(finalComposite)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  // Save 32x32 icon for app/icon.png
  await sharp(finalComposite)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../app/icon.png'));

  // Save ICO file
  await sharp(finalComposite)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/favicon.ico'));

  await sharp(finalComposite)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../app/favicon.ico'));

  console.log('Processed transparent logo and favicons with perfect contrast!');
}

extract().catch(console.error);
