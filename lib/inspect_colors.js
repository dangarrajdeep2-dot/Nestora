const sharp = require('sharp');
const path = require('path');

const srcPath = 'C:/Users/ahirr/.gemini/antigravity/brain/5a5085c4-b5ce-4362-8c29-fb54d64cadd3/.user_uploaded/media_1791454923310_51e5d599.jpg';

async function inspect() {
  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Let's sample along a horizontal line across the center (y = h/2)
  console.log('Sample at center (x=w/2, y=h/2):');
  const getPixel = (x, y) => {
    const idx = (y * w + x) * 3;
    return [data[idx], data[idx+1], data[idx+2]];
  };

  console.log('Center:', getPixel(Math.floor(w/2), Math.floor(h/2)));
  console.log('Top-left (10, 10):', getPixel(10, 10));
  console.log('Inside blue corner (200, 200):', getPixel(200, 200));
  console.log('Near roof (300, 300):', getPixel(300, 300));
  console.log('Near window (500, 400):', getPixel(500, 400));
  console.log('Near bed (400, 550):', getPixel(400, 550));
  console.log('Near smile (500, 750):', getPixel(500, 750));
  console.log('Near pin (780, 480):', getPixel(780, 480));
}

inspect();
