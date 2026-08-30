const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, 'public');
const svgPath = path.join(publicDir, 'favicon.svg');
const svgBuf = fs.readFileSync(svgPath);

async function buildFavicons() {
  const p16 = await sharp(svgBuf).resize(16, 16).png().toBuffer();
  const p32 = await sharp(svgBuf).resize(32, 32).png().toBuffer();
  const p48 = await sharp(svgBuf).resize(48, 48).png().toBuffer();
  const p180 = await sharp(svgBuf).resize(180, 180).png().toBuffer();
  const p192 = await sharp(svgBuf).resize(192, 192).png().toBuffer();
  const p512 = await sharp(svgBuf).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), p16);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), p32);
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), p48);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), p192);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), p512);

  // Build standard multi-res Windows .ico
  const images = [
    { width: 16, height: 16, buf: p16 },
    { width: 32, height: 32, buf: p32 },
    { width: 48, height: 48, buf: p48 }
  ];

  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * images.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += img.buf.length;
  }

  const icoBuf = Buffer.concat([header, ...entries, ...images.map(img => img.buf)]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);

  console.log('Built all favicon variants successfully!');
}

buildFavicons().catch(console.error);
