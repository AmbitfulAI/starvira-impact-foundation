// One-off helper used during development to create responsive founder images.
// Usage: node scripts/process-images.cjs  (requires the optional "sharp" package)
const sharp = require(process.env.SHARP_PATH || 'sharp');
const path = require('path');
const jobs = [
  ['/mnt/user-data/uploads/8af2ffa3-image.jpg', 'jumoke-kolade-portrait'],
  ['/mnt/user-data/uploads/1cfad5fe-image.jpg', 'jumoke-kolade-founder'],
  ['/mnt/user-data/uploads/7328ab9c-image.jpg', 'jumoke-kolade-gallery-1'],
  ['/mnt/user-data/uploads/eb03b9d5-image.jpg', 'jumoke-kolade-gallery-2'],
];
(async () => {
  for (const [src, name] of jobs) {
    const meta = await sharp(src).metadata();
    console.log(name, meta.width, meta.height);
    for (const w of [480, 800, 1200]) {
      if (w > meta.width) continue;
      await sharp(src).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(path.join('public/images/founder', `${name}-${w}.webp`));
    }
    await sharp(src).rotate().resize({ width: 800 }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join('public/images/founder', `${name}-800.jpg`));
  }
})();
