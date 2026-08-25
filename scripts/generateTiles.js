/* eslint-disable */
/**
 * Tile generator for the HGSS Ironmon map.
 *
 * Reads the existing full-resolution region webp images (which are left
 * untouched) and slices each one into a grid of fixed-size tiles, plus a
 * single downscaled "overview" image used as a cheap base layer.
 *
 * Output lands in public/tiles/<region>/:
 *   - tile_<col>_<row>.webp   full-resolution slices (native pixels)
 *   - overview.webp           downscaled whole-map image
 *   - manifest.json           dimensions + tile metadata
 *
 * Run with:  npm run generate:tiles
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Keep in sync with TILE_SIZE / OVERVIEW_MAX_DIM in src/components/TiledMap.tsx
const TILE_SIZE = 1024;
const OVERVIEW_MAX_DIM = 2048;
const TILE_QUALITY = 90;

const ASSETS_DIR = path.join(__dirname, "..", "src", "assets");
const OUTPUT_DIR = path.join(__dirname, "..", "public", "tiles");

const REGIONS = [
  { name: "johto", source: "FullJohto.webp" },
  { name: "kanto", source: "FullKanto.webp" },
];

async function generateRegion(region) {
  const sourcePath = path.join(ASSETS_DIR, region.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source image not found: ${sourcePath}`);
  }

  const outDir = path.join(OUTPUT_DIR, region.name);

  // Skip regeneration when the output already exists and is newer than the
  // source image, so `prebuild`/`prestart` don't re-slice on every run.
  // Set FORCE_TILES=1 to always regenerate.
  const manifestPath = path.join(outDir, "manifest.json");
  if (!process.env.FORCE_TILES && fs.existsSync(manifestPath)) {
    const sourceMtime = fs.statSync(sourcePath).mtimeMs;
    const manifestMtime = fs.statSync(manifestPath).mtimeMs;
    if (manifestMtime >= sourceMtime) {
      console.log(`[${region.name}] up to date, skipping (FORCE_TILES=1 to rebuild)`);
      return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    }
  }

  fs.mkdirSync(outDir, { recursive: true });

  const metadata = await sharp(sourcePath).metadata();
  const { width, height } = metadata;
  const cols = Math.ceil(width / TILE_SIZE);
  const rows = Math.ceil(height / TILE_SIZE);

  console.log(
    `[${region.name}] ${width}x${height} -> ${cols}x${rows} = ${cols * rows} tiles`
  );

  let count = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * TILE_SIZE;
      const top = row * TILE_SIZE;
      const tileWidth = Math.min(TILE_SIZE, width - left);
      const tileHeight = Math.min(TILE_SIZE, height - top);

      await sharp(sourcePath)
        .extract({ left, top, width: tileWidth, height: tileHeight })
        .webp({ quality: TILE_QUALITY })
        .toFile(path.join(outDir, `tile_${col}_${row}.webp`));
      count++;
    }
  }

  // Downscaled overview used as a base layer when zoomed out / while tiles load.
  await sharp(sourcePath)
    .resize({
      width: OVERVIEW_MAX_DIM,
      height: OVERVIEW_MAX_DIM,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: TILE_QUALITY })
    .toFile(path.join(outDir, "overview.webp"));

  const manifest = {
    width,
    height,
    tileSize: TILE_SIZE,
    cols,
    rows,
  };
  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`[${region.name}] wrote ${count} tiles + overview`);
  return manifest;
}

async function main() {
  for (const region of REGIONS) {
    await generateRegion(region);
  }
  console.log("Done generating tiles.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
