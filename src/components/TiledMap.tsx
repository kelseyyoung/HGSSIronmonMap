import React from "react";
import { useViewportSize } from "../IronmonMapUtils";
import "./TiledMap.css";

// Keep TILE_SIZE / OVERVIEW in sync with scripts/generateTiles.js
const TILE_SIZE = 1024;
// Number of extra tile rings to render around the viewport so panning does not
// reveal blank edges before the new tiles load.
const TILE_BUFFER = 1;
// Below this scale the map is zoomed out far enough that the downscaled
// overview looks fine on its own, so we skip loading full-res tiles entirely.
const TILE_MIN_SCALE = 0.25;
// 1px overlap so neighbouring tiles do not show hairline seams when scaled.
const TILE_OVERLAP = 1;

export interface TiledMapProps {
  region: "johto" | "kanto";
  mapWidth: number;
  mapHeight: number;
  scale: number;
  translation: { x: number; y: number };
  // Fired when the base overview image has loaded (used to hide the loading
  // overlay on region change, mirroring the single-image implementation).
  onOverviewLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const TiledMap = (props: TiledMapProps) => {
  const { region, mapWidth, mapHeight, scale, translation, onOverviewLoad } =
    props;
  const viewport = useViewportSize();

  const tileBaseUrl = `${process.env.PUBLIC_URL}/tiles/${region}`;

  const cols = Math.ceil(mapWidth / TILE_SIZE);
  const rows = Math.ceil(mapHeight / TILE_SIZE);

  // Screen space maps to content space as: content = (screen - translation) / scale
  // The visible content rectangle is the viewport (0..w, 0..h) inverse-mapped.
  const visibleTiles = React.useMemo(() => {
    if (scale < TILE_MIN_SCALE) {
      return [] as { col: number; row: number }[];
    }

    const minContentX = (0 - translation.x) / scale;
    const maxContentX = (viewport.width - translation.x) / scale;
    const minContentY = (0 - translation.y) / scale;
    const maxContentY = (viewport.height - translation.y) / scale;

    const colStart = clamp(
      Math.floor(minContentX / TILE_SIZE) - TILE_BUFFER,
      0,
      cols - 1
    );
    const colEnd = clamp(
      Math.floor(maxContentX / TILE_SIZE) + TILE_BUFFER,
      0,
      cols - 1
    );
    const rowStart = clamp(
      Math.floor(minContentY / TILE_SIZE) - TILE_BUFFER,
      0,
      rows - 1
    );
    const rowEnd = clamp(
      Math.floor(maxContentY / TILE_SIZE) + TILE_BUFFER,
      0,
      rows - 1
    );

    const tiles: { col: number; row: number }[] = [];
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        tiles.push({ col, row });
      }
    }
    return tiles;
  }, [scale, translation.x, translation.y, viewport.width, viewport.height, cols, rows]);

  return (
    <div
      className="tiled-map"
      style={{ width: mapWidth, height: mapHeight }}
    >
      {/* Cheap base layer: a single small texture that always covers the map. */}
      <img
        className="pixelated tiled-map-overview"
        width={mapWidth}
        height={mapHeight}
        src={`${tileBaseUrl}/overview.webp`}
        alt={region}
        onLoad={onOverviewLoad}
      />
      {visibleTiles.map(({ col, row }) => {
        const left = col * TILE_SIZE;
        const top = row * TILE_SIZE;
        const width = Math.min(TILE_SIZE, mapWidth - left) + TILE_OVERLAP;
        const height = Math.min(TILE_SIZE, mapHeight - top) + TILE_OVERLAP;
        return (
          <img
            key={`${col}_${row}`}
            className="pixelated tiled-map-tile"
            width={width}
            height={height}
            style={{ left, top }}
            src={`${tileBaseUrl}/tile_${col}_${row}.webp`}
            alt=""
          />
        );
      })}
    </div>
  );
};
