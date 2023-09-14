import React from "react";
import FullJohto from "./assets/FullJohto.webp";
import "./HGSSIronmonMap.css";
import { MapInteractionCSS } from "react-map-interaction";
import { ControlPanel } from "./components";
import {
  items,
  trainers,
  portalGroups,
  defaultItemHeight,
  defaultItemWidth,
  defaultPortalSize,
  defaultTrainerHeight,
  defaultTrainerWidth,
} from "./data";
import { BoundingBoxCoords, Item, MapPortal, Trainer } from "./IronmonMapUtils";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { styled } from '@mui/material/styles';
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

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: 'black',
    fontWeight: 'bold',
    // margin: theme.spacing(0.5),
    // border: 0,
    '&.Mui-selected': {
      backgroundColor: '#d66851'
    },
    '&.Mui-selected:hover': {
      textDecoration: 'underline'
    },
    '&.Mui-disabled': {
      color: '#888'
    },
  },
}));

export const HGSSIronmonMap = () => {
  const [mapData, setMapData] = React.useState<MapInteractionCSSValue>({
    scale: 1,
    translation: { x: -5000, y: -2000 },
  });

  const [currRegion, setCurrRegion] = React.useState<'johto' | 'kanto'>('johto');
  const handleRegionChange = (event: React.MouseEvent<HTMLElement>, newRegion: 'johto' | 'kanto') => {
    setCurrRegion(newRegion)
  }

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

  return (
    <div className="ironmon-map">
      <ControlPanel />
      <StyledToggleButtonGroup className="region-selector" exclusive value={currRegion} onChange={handleRegionChange}>
        <ToggleButton value='johto'>Johto</ToggleButton>
        <ToggleButton value='kanto' disabled>Kanto (Coming Soon)</ToggleButton>
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
        {/* TODO: can we get the height and width from the image? Think "FullKanto" is just the string though */}
        {/* if so, then put into variables */}
        <img
          width="13712"
          height="5893"
          src={FullJohto}
          alt="Full Johto"
          className="pixelated full-map-img"
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
          width="13712"
          height="5893"
          className="svg-container"
        >
          {trainers.map((trainer, index) => {
            return (
              <Trainer
                key={trainer.name.split(" ").join("") + "-" + index}
                height={defaultTrainerHeight}
                width={defaultTrainerWidth}
                {...trainer}
              />
            );
          })}
          {items.map((item, index) => {
            return (
              <Item
                key={"item-" + index}
                height={defaultItemHeight}
                width={defaultItemWidth}
                {...item}
              />
            );
          })}
          {portalGroups.map((portalGroup) => {
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
