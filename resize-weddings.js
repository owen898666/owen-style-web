// Batch resize wedding photos using Jimp (v1 API)
const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const SOURCE_DIR = 'C:\\Users\\user\\Pictures\\OWEN-作品備份\\婚禮紀錄';
const OUTPUT_DIR = path.join(__dirname, 'images', 'weddings');
const MAX_WIDTH = 1600;
const QUALITY = 85;

async function processImage(srcPath, dstPath) {
  try {
    const image = await Jimp.read(srcPath);
    const w = image.width;

    // Resize if needed
    if (w > MAX_WIDTH) {
      image.resize(MAX_WIDTH, Jimp.AUTO);
    }

    // Quality
    image.quality(QUALITY);

    // Write
    await image.writeAsync(dstPath);
    return true;
  } catch (err) {
    console.error(`  [ERR] ${path.basename(srcPath)}: ${err.message}`);
    return false;
  }
}

async function processAlbum(albumPath, albumName) {
  console.log(`\n[${albumName}]`);

  // Safe folder name
  const safeName = albumName.replace(/\s+/g, '-').replace(/&/g, 'and').replace(/[\/\\]/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\-_]/g, '-');
  const albumDir = path.join(OUTPUT_DIR, safeName);

  // Create output dir
  if (!fs.existsSync(albumDir)) {
    fs.mkdirSync(albumDir, { recursive: true });
  }

  // Get all JPG files
  const files = fs.readdirSync(albumPath)
    .filter(f => /\.(jpg|JPG|jpeg|JPEG)$/.test(f))
    .sort();

  if (files.length === 0) {
    console.log('  No JPG files, skipping');
    return null;
  }

  // Process each photo
  const photos = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const srcPath = path.join(albumPath, file);
    const outName = `${String(i + 1).padStart(4, '0')}.jpg`;
    const outPath = path.join(albumDir, outName);

    if (!fs.existsSync(outPath)) {
      await processImage(srcPath, outPath);
    }

    photos.push({ file: outName, alt: `${albumName} - ${i + 1}` });

    if ((i + 1) % 20 === 0) {
      console.log(`  ${i + 1}/${files.length}...`);
    }
  }

  // Write manifest
  const manifest = { album: albumName, photos, count: photos.length };
  fs.writeFileSync(path.join(albumDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`  Done: ${photos.length} photos`);

  return {
    name: albumName,
    slug: safeName,
    count: photos.length,
    cover: `${safeName}/0001.jpg`
  };
}

async function main() {
  // Ensure output dir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all album directories
  const albums = [];
  const dirs = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  console.log(`Found ${dirs.length} wedding albums`);
  console.log('='.repeat(50));

  for (const dir of dirs) {
    const info = await processAlbum(path.join(SOURCE_DIR, dir), dir);
    if (info) albums.push(info);
  }

  // Write master manifest
  fs.writeFileSync(path.join(OUTPUT_DIR, 'albums.json'), JSON.stringify(albums, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log(`TOTAL: ${albums.length} albums, ${albums.reduce((s, a) => s + a.count, 0)} photos`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
