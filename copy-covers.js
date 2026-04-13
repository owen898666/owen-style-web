// Copy only cover photos (first image of each album)
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'C:\\Users\\user\\Pictures\\OWEN-作品備份\\婚禮紀錄';
const OUTPUT_DIR = path.join(__dirname, 'images', 'weddings');

function getCoverImage(albumPath) {
  const files = fs.readdirSync(albumPath)
    .filter(f => /\.(jpg|JPG|jpeg|JPEG)$/.test(f))
    .sort();
  return files[0] || null;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const albums = [];
  const dirs = fs.readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  console.log(`Processing ${dirs.length} albums...`);

  for (const dir of dirs) {
    const albumPath = path.join(SOURCE_DIR, dir);
    const coverFile = getCoverImage(albumPath);

    if (!coverFile) continue;

    // Safe folder name
    const safeName = dir.replace(/\s+/g, '-').replace(/&/g, 'and').replace(/[\/\\]/g, '-')
      .replace(/[^a-zA-Z0-9\u4e00-\u9fff\-_]/g, '-');

    // Copy cover image
    const srcPath = path.join(albumPath, coverFile);
    const dstPath = path.join(OUTPUT_DIR, `${safeName}.jpg`);

    // Just copy without resize (Netlify will handle)
    fs.copyFileSync(srcPath, dstPath);

    // Count photos
    const count = fs.readdirSync(albumPath).filter(f => /\.(jpg|JPG|jpeg|JPEG)$/i.test(f)).length;

    albums.push({
      name: dir,
      slug: safeName,
      count: count,
      cover: `${safeName}.jpg`
    });

    console.log(`  ${dir} (${count} photos)`);
  }

  // Write manifest
  fs.writeFileSync(path.join(OUTPUT_DIR, 'albums.json'), JSON.stringify(albums, null, 2));

  console.log(`\nDone: ${albums.length} albums, covers copied to ${OUTPUT_DIR}`);
}

main();
