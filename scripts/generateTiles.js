/* eslint-disable */
/**
 * HGSS-specific entry point for tile generation.
 *
 * The reusable slicing logic lives in the IronmonMapUtils submodule; this file
 * only supplies the app-specific config (which regions exist and where the
 * source images / output live). Run with:  npm run generate:tiles
 */
const path = require("path");
const {
  generateTiles,
} = require("../src/IronmonMapUtils/scripts/generateTiles");

const REGIONS = [
  { name: "johto", source: "FullJohto.webp" },
  { name: "kanto", source: "FullKanto.webp" },
];

generateTiles({
  regions: REGIONS,
  assetsDir: path.join(__dirname, "..", "src", "assets"),
  outputDir: path.join(__dirname, "..", "public", "tiles"),
})
  .then(() => {
    console.log("Done generating tiles.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
