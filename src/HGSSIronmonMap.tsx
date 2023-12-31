import React, { SyntheticEvent } from "react";
import FullJohto from "./assets/FullJohto.webp";
import FullKanto from "./assets/FullKanto.webp";
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
  Trainer,
  TrainerData,
} from "./IronmonMapUtils";
import {
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { kantoPortalGroups } from "./data/kantoPortals";
// import { useAppSelector } from "./IronmonMapUtils/state";

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
  mapName: string;
  mapHeight: number;
  mapWidth: number;
  portals: MapPortalGroup[];
  // TODO: route pictures and sizes
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  "& .MuiToggleButtonGroup-grouped": {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "black",
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
    mapName: FullJohto,
    mapHeight: 5893,
    mapWidth: 13712,
    portals: johtoPortals,
  });

  const [showLoadingScreen, setShowLoadingScreen] = React.useState(false);

  const handleRegionChange = (
    event: React.MouseEvent<HTMLElement>,
    newRegion: "johto" | "kanto"
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
          mapName: FullJohto,
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
          mapName: FullKanto,
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

  // const showRoutes = useAppSelector((state) => state.settings).showRoutes;

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
    [setMapData]
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
      <MapInteractionCSS
        value={mapData}
        onChange={(value: MapInteractionCSSValue) => {
          setMapData(value);
        }}
        maxScale={100}
      >
        <div
          id="portal-label-container"
          className="react-portal-container"
        ></div>
        <div id="tooltip-container" className="react-portal-container"></div>
        <img
          width={regionData.mapWidth}
          height={regionData.mapHeight}
          src={regionData.mapName}
          alt={regionData.name}
          className="pixelated full-map-img"
          onLoad={onImageLoad}
        ></img>
        {/* <img
          width="7700"
          height="6400"
          alt="All Routes"
          className={`full-map-img ${
            showRoutes ? "routes-visible" : "routes-hidden"
          }`}
          src={FullKantoPaths}
        ></img> */}
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width={regionData.mapWidth}
          height={regionData.mapHeight}
          className="svg-container"
        >
          {regionData.trainers.map((trainer, index) => {
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
            return portalGroup.portals.map((portal, portalIndex) => (
              <MapPortal
                key={"portal-" + portalIndex}
                index={portalIndex + 1}
                scale={mapData.scale}
                offsetMapCoords={offsetMapCoords}
                color={portalGroup.color}
                size={defaultPortalSize}
                {...portal}
              />
            ));
          })}
        </svg>
      </MapInteractionCSS>
    </div>
  );
};
