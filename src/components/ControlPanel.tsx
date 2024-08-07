import React from "react";
import "./ControlPanel.css";
import PokeBall from "../IronmonMapUtils/assets/PokeballItem.png";
import TMItem from "../IronmonMapUtils/assets/TMItem.png";
import HiddenItem from "../IronmonMapUtils/assets/HiddenItem.png";
import TrainerDemo from "../assets/demoGifs/TrainerDemo.gif";
import ItemDemo from "../assets/demoGifs/ItemDemo.gif";
import PortalClickDemo from "../assets/demoGifs/PortalClickDemo.gif";
import MapPortalsDemo from "../assets/demoGifs/MapPortalsDemo.gif";
import {
  Dialog,
  DialogTitle,
  Icon,
  AccordionSummary,
  AccordionDetails,
  Accordion,
  FormGroup,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  FormLabelProps,
  CheckboxProps,
  RadioProps,
  IconButton,
  IconButtonProps,
  AccordionProps,
  DialogContent,
} from "@mui/material";
import {
  MapPortalLinesType,
  mapSettingsSlice,
  useAppDispatch,
  useAppSelector,
} from "../IronmonMapUtils/state";
import { styled } from "@mui/material/styles";

const ControlPanelSubtitle = styled(FormLabel)<FormLabelProps>(({ theme }) => ({
  fontWeight: "bold",
  color: theme.palette.text.primary,
}));

const ControlPanelCheckbox = styled(Checkbox)<CheckboxProps>(() => ({
  padding: "4px 9px",
}));

const ControlPanelRadio = styled(Radio)<RadioProps>(() => ({
  padding: "4px 9px",
}));

const ControlPanelIconButton = styled(IconButton)<IconButtonProps>(
  ({ theme }) => ({
    color: theme.palette.text.primary,
  })
);

const ControlPanelAccordion = styled(Accordion)<AccordionProps>(() => ({
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
}));

export const ControlPanel = () => {
  const {
    showTrainerData,
    highlightItems,
    highlightTMs,
    highlightHiddenItems,
    showMapPortals,
    showMapPortalLines,
    showMapPortalLinesType,
    showRoutes,
  } = useAppSelector((state) => state.settings);
  const {
    setShowTrainerData,
    setHighlightItems,
    setHighlightTMs,
    setHighlightHiddenItems,
    setShowMapPortals,
    setShowMapPortalLines,
    setShowMapPortalLinesType,
    setShowRoutes,
  } = mapSettingsSlice.actions;
  const dispatch = useAppDispatch();

  const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);

  const onPortalLinesRadioChanged = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(
        setShowMapPortalLinesType(
          parseInt(event.target.value) as MapPortalLinesType
        )
      );
    },
    [dispatch, setShowMapPortalLinesType]
  );

  return (
    <>
      <div className="control-panel">
        <ControlPanelAccordion disableGutters>
          <AccordionSummary
            expandIcon={<Icon fontSize="small">{"expand_more"}</Icon>}
            sx={{
              minHeight: 36,
              padding: "0 8px",
              fontWeight: "bold",
              fontSize: 18,
              "& .MuiAccordionSummary-content": {
                margin: "8px 0",
              },
            }}
          >
            Control Panel
          </AccordionSummary>
          <AccordionDetails sx={{ padding: "8px" }}>
            <ControlPanelSubtitle>Trainer/Item Info</ControlPanelSubtitle>
            <FormGroup sx={{ paddingBottom: "4px" }}>
              <FormControlLabel
                control={
                  <ControlPanelCheckbox
                    checked={showTrainerData}
                    onChange={() => {
                      dispatch(setShowTrainerData(!showTrainerData));
                    }}
                    size="small"
                  />
                }
                label="Show Trainer Data"
              />
            </FormGroup>
            <ControlPanelSubtitle>Highlight Items</ControlPanelSubtitle>
            <FormGroup sx={{ paddingBottom: "4px" }}>
              <FormControlLabel
                control={
                  <ControlPanelCheckbox
                    checked={highlightItems}
                    onChange={() =>
                      dispatch(setHighlightItems(!highlightItems))
                    }
                    size="small"
                  />
                }
                label={
                  <span className="checkbox-label">
                    <img
                      alt="Item"
                      className="item-checkbox-img"
                      src={PokeBall}
                    />
                    Regular
                  </span>
                }
              />
              <FormControlLabel
                control={
                  <ControlPanelCheckbox
                    checked={highlightTMs}
                    onChange={() => dispatch(setHighlightTMs(!highlightTMs))}
                    size="small"
                  />
                }
                label={
                  <span className="checkbox-label">
                    <img alt="TM" className="item-checkbox-img" src={TMItem} />
                    TMs
                  </span>
                }
              />
              <FormControlLabel
                control={
                  <ControlPanelCheckbox
                    checked={highlightHiddenItems}
                    onChange={() =>
                      dispatch(setHighlightHiddenItems(!highlightHiddenItems))
                    }
                    size="small"
                  />
                }
                label={
                  <span className="checkbox-label">
                    <img
                      alt="Hidden Item"
                      className="item-checkbox-img"
                      src={HiddenItem}
                    />
                    Hidden
                  </span>
                }
              />
            </FormGroup>
            <ControlPanelSubtitle>Map Portals</ControlPanelSubtitle>
            <FormGroup>
              <FormControlLabel
                control={
                  <ControlPanelCheckbox
                    checked={showMapPortals}
                    onChange={() =>
                      dispatch(setShowMapPortals(!showMapPortals))
                    }
                    size="small"
                  />
                }
                label={"Show Map Portals"}
              />
              <FormControlLabel
                control={
                  <ControlPanelCheckbox
                    checked={showMapPortalLines}
                    onChange={() =>
                      dispatch(setShowMapPortalLines(!showMapPortalLines))
                    }
                    size="small"
                  />
                }
                label={"Connect Portals"}
              />
            </FormGroup>
            <FormGroup sx={{ paddingBottom: "4px" }}>
              <RadioGroup row>
                <FormControlLabel
                  disabled={!showMapPortalLines}
                  name="portalLines"
                  value={MapPortalLinesType.Always}
                  control={
                    <ControlPanelRadio
                      checked={
                        showMapPortalLinesType === MapPortalLinesType.Always
                      }
                      onChange={onPortalLinesRadioChanged}
                      size="small"
                    />
                  }
                  label="Always"
                />
                <FormControlLabel
                  disabled={!showMapPortalLines}
                  name="portalLines"
                  value={MapPortalLinesType.Hover}
                  control={
                    <ControlPanelRadio
                      checked={
                        showMapPortalLinesType === MapPortalLinesType.Hover
                      }
                      onChange={onPortalLinesRadioChanged}
                      size="small"
                    />
                  }
                  label="Hover"
                />
              </RadioGroup>
            </FormGroup>
            <ControlPanelSubtitle>Routes</ControlPanelSubtitle>
            <FormGroup>
              <FormControlLabel
                control={
                  <ControlPanelCheckbox
                    checked={showRoutes}
                    onChange={() => dispatch(setShowRoutes(!showRoutes))}
                    size="small"
                  />
                }
                label="Show Routes"
              />
            </FormGroup>
            <hr />
            <div className="buttons-container">
              <ControlPanelIconButton
                size="small"
                onClick={() => setInfoDialogOpen(true)}
              >
                <Icon fontSize="small">info</Icon>
              </ControlPanelIconButton>
              <ControlPanelIconButton
                size="small"
                onClick={() => setHelpDialogOpen(true)}
              >
                <Icon fontSize="small">help</Icon>
              </ControlPanelIconButton>
            </div>
          </AccordionDetails>
        </ControlPanelAccordion>
      </div>
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        scroll={"paper"}
        maxWidth={"md"}
      >
        <DialogTitle>About</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setInfoDialogOpen(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <Icon>close</Icon>
        </IconButton>
        <DialogContent>
          <div className="dialog-text">
            Trainer information is available on hover, showing the number of
            pokemon they have, the levels of their pokemon, and any movement
            information. Trainers can be "marked" by clicking on them
            <div className="demo-gif">
              <img src={TrainerDemo} />
            </div>
          </div>
          <div className="dialog-text">
            Items are also clickable/markable, and hidden items with step spawn
            rates have that information shown on hover
            <div className="demo-gif">
              <img src={ItemDemo} />
            </div>
          </div>
          <div className="dialog-text">
            Map "portals", like cave entrances and ladders, are clickable too!
            They will move the map to where it connects
            <div className="demo-gif">
              <img src={PortalClickDemo} />
            </div>
          </div>
          <div className="dialog-text">
            You can highlight all map portals via the Control Panel with various
            display options
            <div className="demo-gif">
              <img src={MapPortalsDemo} />
            </div>
          </div>
          <div className="dialog-text">
            <h4>Credits</h4>
            <div>
              Maps from{" "}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://bulbapedia.bulbagarden.net/wiki/Appendix:HeartGold_and_SoulSilver_walkthrough"
              >
                Bulbapedia
              </a>
            </div>
            <div>
              Sprites from{" "}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://www.spriters-resource.com/ds_dsi/pokemonheartgoldsoulsilver/sheet/26955/"
              >
                The Spriters Resource
              </a>
            </div>
            <div>
              Hidden item information from{" "}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://imgur.com/a/ohFwS3O"
              >
                here
              </a>{" "}
              and trainer information from{" "}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://docs.google.com/spreadsheets/d/1eKixgsOxucM9M7kdA7QKsxqPhyO4CUtGbFgKjysCxxI/edit"
              >
                here
              </a>
              , from the Ironmon community
            </div>
          </div>
          <div className="dialog-text">
            More information about this map can be found on the{" "}
            <a
              rel="noreferrer"
              href="https://github.com/kelseyyoung/HGSSIronmonMap"
              target="_blank"
            >
              Github README
            </a>
            . This has been a fun passion project of mine, and I appreciate you
            checking out the app! Shoutouts to the Ironmon community as well for
            creating such a fun challenge run! If you are interested in learning
            more about Ironmon,{" "}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://discord.gg/QEEsmNUX"
            >
              join the discord
            </a>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        scroll={"paper"}
      >
        <DialogTitle>Help</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setHelpDialogOpen(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <Icon>close</Icon>
        </IconButton>
        <DialogContent>
          <div className="dialog-text">
            This is very much still a work in progress so there are sure to be
            bugs/missing data. The best way to file an issue is on{" "}
            <a
              rel="noreferrer"
              href="https://github.com/kelseyyoung/HGSSIronmonMap/issues"
              target="_blank"
            >
              Github
            </a>{" "}
            or contact me on Discord (kelsey4)
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
