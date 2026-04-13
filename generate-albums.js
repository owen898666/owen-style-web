// Generate individual album HTML pages
const fs = require('fs');
const path = require('path');

const TEMPLATE = fs.readFileSync(path.join(__dirname, 'weddings', 'album-template.html'), 'utf8');
const OUTPUT_DIR = path.join(__dirname, 'weddings');
const MANIFEST_PATH = path.join(__dirname, 'images', 'weddings', 'albums.json');

function main() {
  const albums = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  console.log(`Generating ${albums.length} album pages...`);

  for (const album of albums) {
    const html = TEMPLATE
      .replace(/\{\{ALBUM_NAME\}\}/g, album.name)
      .replace(/\{\{ALBUM_SLUG\}\}/g, album.slug)
      .replace(/\{\{PHOTO_COUNT\}\}/g, album.count);

    const outPath = path.join(OUTPUT_DIR, `${album.slug}.html`);
    fs.writeFileSync(outPath, html);
  }

  console.log(`Done: ${albums.length} pages generated`);
}

main();
