import React, { SyntheticEvent } from "react";
import BellTowerRoute from "./assets/BellTowerRoute.webp";
import WhirlIslandsRoute from "./assets/WhirlIslandsRoute.webp";
import IceCaveRoute from "./assets/IceCaveRoute.webp";
import DarkCaveRoute from "./assets/DarkCaveRoute.webp";
import MtMortarRoute from "./assets/MtMortarRoute.webp";
import VictoryRoadRoute from "./assets/VictoryRoadRoute.webp";
import RockTunnelRoute from "./assets/RockTunnelRoute.webp";
import CeruleanCaveRoute from "./assets/CeruleanCaveRoute.webp";
import MtSilverRoute from "./assets/MtSilverRoute.webp";
import SeafoamIslandsRoute from "./assets/SeafoamIslandsRoute.webp";
import ViridianGymRoute from "./assets/ViridianGymRoute.webp";
import "./HGSSIronmonMap.css";
import { MapInteractionCSS } from "react-map-interaction";
import { ControlPanel } from "./components";
import {
  items as johtoItems,
  trainers as johtoTrainers,
  kantoTrainers,
  portalGroups as johtoPortals,
  defaultItemHeight,
  defaultItemWidth,
  defaultPortalSize,
  defaultTrainerHeight,
  defaultTrainerWidth,
  kantoItems,
} from "./data";
import {
  BoundingBoxCoords,
  Item,
  ItemData,
  MapPortal,
  MapPortalGroup,
  TiledMap,
  Trainer,
  TrainerData,
  computeVisibleBounds,
  isBoxVisible,
  useRafThrottledValue,
  useViewportSize,
} from "./IronmonMapUtils";
import {
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { kantoPortalGroups } from "./data/kantoPortals";
import { useAppSelector } from "./IronmonMapUtils/state";

export interface MapInteractionCSSValue {
  scale: number;
  translation: BoundingBoxCoords;

  // Translation directions
  // Move map "up": decrease y
  // Move map "down": increase y
  // Move map "right": increase x
  // Move map "left": decrease x
}

type RegionData = {
  name: "johto" | "kanto";
  trainers: TrainerData[];
  items: ItemData[];
  mapHeight: number;
  mapWidth: number;
  portals: MapPortalGroup[];
  // TODO: route pictures and sizes
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "black",
    marginLeft: "20px",
    fontWeight: "bold",
    "&.Mui-selected": {
      backgroundColor: "#d66851",
    },
    "&.MuiToggleButton-root:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      textDecoration: "underline",
    },
    "&.Mui-selected:hover": {
      backgroundColor: "#d66851",
      textDecoration: "underline",
    },
    "&.Mui-disabled": {
      color: "#888",
    },
  },
}));

const frameCallbacks = 5;

// Extra content-space padding around the viewport when culling SVG overlay
// entities, so markers and their tooltips near the edge don't pop in/out while
// panning. Sized comfortably larger than any single entity + tooltip.
const VIRTUALIZATION_MARGIN = 300;

export const HGSSIronmonMap = () => {
  const [mapData, setMapData] = React.useState<MapInteractionCSSValue>({
    scale: 1,
    // Start kinda in the middle of Johto, the map doesn't have anything in the top left corner
    translation: { x: -5000, y: -2000 },
  });

  // Initial state of things, default is Johto
  const [regionData, setRegionData] = React.useState<RegionData>({
    name: "johto",
    trainers: johtoTrainers,
    items: johtoItems,
    mapHeight: 5893,
    mapWidth: 13712,
    portals: johtoPortals,
  });

  const [showLoadingScreen, setShowLoadingScreen] = React.useState(false);

  const handleRegionChange = (
    event: React.MouseEvent<HTMLElement>,
    newRegion: "johto" | "kanto",
  ) => {
    // Put up loading screen
    setShowLoadingScreen(true);

    setTimeout(() => {
      // Toggle trainers, itens, portals, images, image sizes
      if (newRegion === "johto") {
        // Johto
        setRegionData({
          name: "johto",
          trainers: johtoTrainers,
          items: johtoItems,
          mapHeight: 5893,
          mapWidth: 13712,
          portals: johtoPortals,
        });

        // Reset map position
        setMapData({
          scale: 1,
          translation: { x: -5000, y: -2000 },
        });
      } else {
        // Kanto
        setRegionData({
          name: "kanto",
          trainers: kantoTrainers,
          items: kantoItems,
          mapHeight: 6994,
          mapWidth: 9736,
          portals: kantoPortalGroups,
        });

        // Reset map position
        setMapData({
          scale: 1,
          translation: { x: -7000, y: -2000 },
        });
      }
    }, 0);
  };

  const { showRoutes } = useAppSelector((state) => state.settings);

  // The live `mapData` drives the CSS transform every frame so the map stays
  // responsive, but the derived culling work (SVG overlay + tile selection)
  // only needs to run once per painted frame. Throttling to animation frames
  // coalesces the multiple transform updates a single zoom gesture can emit.
  const throttledMapData = useRafThrottledValue(mapData);

  // Latest scale, read only inside portal click handlers. Kept in a ref so
  // zooming doesn't re-render every MapPortal on every frame.
  const scaleRef = React.useRef(mapData.scale);
  scaleRef.current = mapData.scale;

  // Virtualize the SVG overlay: only render trainers/items/portals whose
  // bounding box intersects the current viewport (plus a margin). Hundreds of
  // entities per region would otherwise sit in the DOM even when zoomed/panned
  // far away from them.
  const viewport = useViewportSize();
  const visibleBounds = React.useMemo(
    () =>
      computeVisibleBounds(
        throttledMapData.translation,
        throttledMapData.scale,
        viewport,
        VIRTUALIZATION_MARGIN,
      ),
    [throttledMapData.translation, throttledMapData.scale, viewport],
  );

  const offsetMapCoords = React.useCallback(
    (x: number, y: number) => {
      setMapData((value: MapInteractionCSSValue) => {
        return {
          ...value,
          translation: {
            x: value.translation.x + x,
            y: value.translation.y + y,
          },
        };
      });
    },
    [setMapData],
  );

  const requestFrameMaybe = (callbackNum: number) => {
    if (callbackNum === 0) {
      setShowLoadingScreen(false);
    } else {
      requestAnimationFrame(() => {
        requestFrameMaybe(callbackNum - 1);
      });
    }
  };

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    requestFrameMaybe(frameCallbacks);
  };

  return (
    <div className="ironmon-map">
      <div className={`loading-overlay ${showLoadingScreen ? "visible" : ""}`}>
        <CircularProgress />
        <div className="loading-label">Loading...</div>
      </div>
      <ControlPanel />
      <StyledToggleButtonGroup
        className="region-selector"
        exclusive
        value={regionData.name}
        onChange={handleRegionChange}
      >
        <ToggleButton value="johto">Johto</ToggleButton>
        <ToggleButton value="kanto">Kanto</ToggleButton>
      </StyledToggleButtonGroup>
      <div className="map-viewport">
        <MapInteractionCSS
          value={mapData}
          onChange={(value: MapInteractionCSSValue) => {
            setMapData(value);
          }}
          maxScale={8}
        >
          <div
            id="portal-label-container"
            className="react-portal-container"
          ></div>
          <div id="tooltip-container" className="react-portal-container"></div>
          <TiledMap
            region={regionData.name}
            mapWidth={regionData.mapWidth}
            mapHeight={regionData.mapHeight}
            scale={throttledMapData.scale}
            translation={throttledMapData.translation}
            onOverviewLoad={onImageLoad}
          />
          <img
            width="1800"
            height="1200"
            style={{
              position: "absolute",
              top: 690,
              left: 3196,
            }}
            alt="Bell Tower Route"
            className={`${
              showRoutes && regionData.name === "johto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={BellTowerRoute}
          ></img>
          <img
            width="1600"
            height="1250"
            style={{
              position: "absolute",
              top: 4600,
              left: 1680,
            }}
            alt="Whirl Islands Route"
            className={`${
              showRoutes && regionData.name === "johto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={WhirlIslandsRoute}
          ></img>
          <img
            width="1533"
            height="1145"
            style={{
              position: "absolute",
              top: 386,
              left: 8320,
            }}
            alt="Ice Cave Route"
            className={`${
              showRoutes && regionData.name === "johto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={IceCaveRoute}
          ></img>
          <img
            width="1100"
            height="1630"
            style={{
              position: "absolute",
              top: 2288,
              left: 8039,
            }}
            alt="Dark Cave Route"
            className={`${
              showRoutes && regionData.name === "johto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={DarkCaveRoute}
          ></img>
          <img
            width="2600"
            height="1900"
            style={{
              position: "absolute",
              top: 0,
              left: 4500,
            }}
            alt="Mt Mortar Route"
            className={`${
              showRoutes && regionData.name === "johto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={MtMortarRoute}
          ></img>
          <img
            width="1300"
            height="2000"
            style={{
              position: "absolute",
              top: 2738,
              left: 12076,
            }}
            alt="Victory Road Route"
            className={`${
              showRoutes && regionData.name === "johto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={VictoryRoadRoute}
          ></img>
          <img
            width="900"
            height="1100"
            style={{
              position: "absolute",
              top: 1639,
              left: 8424,
            }}
            alt="Rock Tunnel Route"
            className={`${
              showRoutes && regionData.name === "kanto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={RockTunnelRoute}
          ></img>
          <img
            width="3200"
            height="700"
            style={{
              position: "absolute",
              top: 192,
              left: 4582,
            }}
            alt="Cerulean Cave Route"
            className={`${
              showRoutes && regionData.name === "kanto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={CeruleanCaveRoute}
          ></img>
          <img
            width="2100"
            height="2000"
            style={{
              position: "absolute",
              top: 1440,
              left: 0,
            }}
            alt="Mt Silver Route"
            className={`${
              showRoutes && regionData.name === "kanto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={MtSilverRoute}
          ></img>
          <img
            width="864"
            height="1961"
            style={{
              position: "absolute",
              top: 4508,
              left: 3654,
            }}
            alt="Seafoam Islands Route"
            className={`${
              showRoutes && regionData.name === "kanto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={SeafoamIslandsRoute}
          ></img>
          <img
            width="236"
            height="621"
            style={{
              position: "absolute",
              top: 2958,
              left: 3541,
            }}
            alt="Viridian Gym Route"
            className={`${
              showRoutes && regionData.name === "kanto"
                ? "routes-visible"
                : "routes-hidden"
            }`}
            src={ViridianGymRoute}
          ></img>
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width={regionData.mapWidth}
            height={regionData.mapHeight}
            className="svg-container"
          >
            {regionData.trainers.map((trainer, index) => {
              if (
                !isBoxVisible(
                  trainer.x,
                  trainer.y,
                  defaultTrainerWidth,
                  defaultTrainerHeight,
                  visibleBounds,
                )
              ) {
                return null;
              }
              return (
                <Trainer
                  key={trainer.name.split(" ").join("") + "-" + index}
                  height={defaultTrainerHeight}
                  width={defaultTrainerWidth}
                  {...trainer}
                />
              );
            })}
            {regionData.items.map((item, index) => {
              if (
                !isBoxVisible(
                  item.x,
                  item.y,
                  defaultItemWidth,
                  defaultItemHeight,
                  visibleBounds,
                )
              ) {
                return null;
              }
              return (
                <Item
                  key={"item-" + index}
                  height={defaultItemHeight}
                  width={defaultItemWidth}
                  {...item}
                />
              );
            })}
            {regionData.portals.map((portalGroup) => {
              return portalGroup.portals.map((portal, portalIndex) => {
                // Keep the pair (and its connecting line) if either endpoint is
                // on-screen.
                const visible =
                  isBoxVisible(
                    portal.portal1.x,
                    portal.portal1.y,
                    defaultPortalSize,
                    defaultPortalSize,
                    visibleBounds,
                  ) ||
                  isBoxVisible(
                    portal.portal2.x,
                    portal.portal2.y,
                    defaultPortalSize,
                    defaultPortalSize,
                    visibleBounds,
                  );
                if (!visible) {
                  return null;
                }
                return (
                  <MapPortal
                    key={"portal-" + portalIndex}
                    index={portalIndex + 1}
                    scaleRef={scaleRef}
                    offsetMapCoords={offsetMapCoords}
                    color={portalGroup.color}
                    size={defaultPortalSize}
                    {...portal}
                  />
                );
              });
            })}
          </svg>
        </MapInteractionCSS>
      </div>
    </div>
  );
};
