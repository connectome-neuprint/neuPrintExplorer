import PropTypes from 'prop-types';
import React, { useMemo, useContext, useState, useEffect } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleOffIcon from '@material-ui/icons/ToggleOff';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import MenuIcon from '@material-ui/icons/Menu';

import { NgViewerContext } from 'contexts/NgViewerContext';

const styles = (theme) => ({
  root: {
    width: '100%',
    flexGrow: true,
  },
  flex: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  cachedTime: {
    color: '#555',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: theme.spacing(2),
  },
});

// Convert the neuroglancer state into a URL fragment.
// Copied from the neuroglancer source code.
function encodeFragment(fragment) {
  return encodeURI(fragment).replace(
    /[!'()*;,]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function NeuroglancerMenu({ classes, dataSet }) {
  const { ngViewerState, setNgViewerState } = useContext(NgViewerContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [ngState, setNgState] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/npexplorer/nglayers/${dataSet}-actions.json`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && typeof data === 'object') {
          setNgState(data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching neuroglancer actions:', error);
      }
    };

    fetchData();
  }, [dataSet]);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOpenInNewWindow = () => {
    // grab the neuroglancer state for this dataset
    const tabState = ngViewerState[dataSet];
    const encodedState = encodeFragment(JSON.stringify(tabState));
    // convert it into a URL
    const url = `https://clio-ng.janelia.org/#!${encodedState}`;
    // open a new window with that URL
    window.open(url, '_blank');
  };

  const handleUpdateNgState = (newState) => {
    setNgViewerState((prevState) => {
      const newNgState = { ...prevState, [dataSet]: newState };
      return newNgState;
    });
    handleCloseMenu();
  };

  const handleLayerUpdate = (layerName, layerUpdate) => {
    setNgViewerState((prevState) => {
      const tabState = prevState[dataSet];
      const layerOfInterest = tabState.layers.find((layer) => layer.name === layerName);
      if (layerOfInterest) {
        const newLayer = { ...layerOfInterest, ...layerUpdate };
        const newLayers = tabState.layers.map((layer) => {
          if (layer.name === layerName) {
            return newLayer;
          }
          return layer;
        });
        const newTabState = { ...tabState, layers: newLayers };
        const newState = { ...prevState, [dataSet]: newTabState };
        return newState;
      }
      return prevState;
    });
    handleCloseMenu();
  };

  const handleLayerAttributeToggle = (layerName, attributeToToggle) => {
    setNgViewerState((prevState) => {
      const tabState = prevState[dataSet];
      const layerOfInterest = tabState.layers.find((layer) => layer.name === layerName);
      if (layerOfInterest) {
        const attribute = layerOfInterest[attributeToToggle];
        if (attribute === undefined) {
          layerOfInterest[attributeToToggle] = false;
        } else {
          layerOfInterest[attributeToToggle] = !layerOfInterest[attributeToToggle];
        }
        const newState = { ...prevState, [dataSet]: tabState };
        return newState;
      }
      return prevState;
    });
    handleCloseMenu();
  };

  const handleSkeletonMeshToggle = () => {
    // TODO: implement the skeleton/mesh toggle
    // eslint-disable-next-line no-console
    console.log('handleSkeletonMeshToggle');
  };

  // custom menu options for the neuroglancer viewer
  // these are defined in the nglayers/{dataset}-actions.json that is loaded from neuprintHTTP
  // to create one of these add an [] of action objects to the file
  //
  // each menu option should have the following fields:
  //  - name: the name of the menu option that will be displayed
  //  - stateUpdate: an object that will be merged with the top level of the neuroglancer state
  //
  //  or
  //
  //  - name: the name of the menu option that will be displayed
  //  - layerUpdate: an object that will be merged with the layer specified by layerName
  //  - layerName: the name of the layer to update
  //
  //  or
  //
  //  - name: the name of the menu option that will be displayed
  //  - layerName: the name of the layer to update
  //  - attributeToToggle: the attribute to toggle on the layer specified by layerName
  //
  // here is an example of a few menu options:
  // [
  //   {
  //    "name": "Toggle Segmentation",
  //    "layerName": "segmentation",
  //    "attributeToToggle": "visible"
  //   }
  //
  //   {
  //    "name": "Show Segmentation",
  //    "layerName": "segmentation",
  //    "layerUpdate": {
  //      "visible": true
  //    }
  //   }
  //
  //   {
  //    "name": "reset view",
  //    "stateUpdate": {
  //      "position": [
  //        0 , 0, 0
  //      ],
  //      "projectionOrientation": [
  //        0, 0, 0, 1
  //      ],
  //      "projectionScale": 8000
  //    }
  //  }
  // ]

  // generate menu options based on the items in the ngState
  const menuItems = ngState.map((option) => {
    const onClick = () => {
      // if there is a stateUpdate, apply it to the neuroglancer
      // state at the top level
      if (option.stateUpdate) {
        handleUpdateNgState(option.stateUpdate);
      }
      // if there is a layerUpdate/layerName, apply it to the layer specified
      else if (option.layerUpdate && option.layerName) {
        handleLayerUpdate(option.layerName, option.layerUpdate);
      } else if (option.layerName && option.attributeToToggle) {
        handleLayerAttributeToggle(option.layerName, option.attributeToToggle);
      }
    };
    return (
      <MenuItem key={option.name} aria-label={option.name} onClick={onClick}>
        <DoubleArrowIcon className={classes.menuIcon} /> {option.name}
      </MenuItem>
    );
  });

  const newIconStyle = useMemo(() => ({
    fontSize: 18,
  }), []);

  return (
    <>
      {menuItems.length > 0 ? (
        <>
          <Tooltip title="Neuroglancer Actions">
            <IconButton
              className={classes.button}
              aria-label="Neuroglancer Menu"
              onClick={handleOpenMenu}
            >
              <MenuIcon style={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            {menuItems}
            <MenuItem
              aria-label="Switch between meshes and skeletons"
              onClick={() => {
                handleSkeletonMeshToggle();
              }}
            >
              <ToggleOffIcon className={classes.menuIcon} /> Switch between meshes and skeletons
            </MenuItem>
          </Menu>
        </>
      ) : null}

      <Tooltip title="Open in new window">
        <IconButton
          className={classes.button}
          aria-label="Open in new window"
          onClick={handleOpenInNewWindow}
        >
          <OpenInNewIcon style={newIconStyle} />
        </IconButton>
      </Tooltip>
    </>
  );
}

NeuroglancerMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
};

export default withStyles(styles)(NeuroglancerMenu);
