const sharp = require('sharp');
const path = require('path');

const srcPath = 'C:/Users/ahirr/.gemini/antigravity/brain/5a5085c4-b5ce-4362-8c29-fb54d64cadd3/.user_uploaded/media_1791454923310_51e5d599.jpg';

async function processImage() {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Let's sample the corner / background blue color
  // The background is blue: high blue, low red, moderate green, e.g. R < 60, G < 100, B > 120
  // Or outside the house/bed/pin/smile.
  console.log(`Dimensions: ${width}x${height}, channels: ${channels}`);
  
  // Sample top-left corner
  console.log(`Top-left pixel: R=${data[0]}, G=${data[1]}, B=${data[2]}, A=${data[3]}`);

  // Create transparent buffer
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if it's the blue background (blue dominant, significantly higher than red and green)
    // Or blue is dominant: b > 100 and b > r + 40 and b > g + 20
    const isBlueBg = (b > r + 35) && (b > g + 15) && (b > 70);
    
    // Also check dark shadows near corners if any
    const isDarkCorner = (r < 25 && g < 25 && b < 40);

    if (isBlueBg || isDarkCorner) {
      data[i + 3] = 0; // Transparent
    }
  }

  const outBuffer = await sharp(data, {
    raw: {
      width,
      height,
      channels,
    }
  })
  .png()
  .toBuffer();

  // Save to public/logo.png and public/favicon.png
  await sharp(outBuffer)
    .trim() // Trim transparent edges
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/logo.png'));

  // Also create 32x32 and 64x64 favicon versions
  await sharp(outBuffer)
    .trim()
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  await sharp(outBuffer)
    .trim()
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../app/icon.png'));

  console.log('Background removed and files saved successfully!');
}

processImage().catch(console.error);
