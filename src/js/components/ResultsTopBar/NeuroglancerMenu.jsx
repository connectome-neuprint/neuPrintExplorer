import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import HistoryIcon from '@material-ui/icons/History';
import ToggleOffIcon from '@material-ui/icons/ToggleOff';

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

  const handleResetViewToBrain = () => {
    setNgViewerState((prevState) => {
      const newState = { ...prevState, [dataSet]: { ...prevState[dataSet], perspectiveZoom: 80 } };
      return newState;
    });
    handleCloseMenu();
  };

  const handleResetViewToVNC = () => {
    setNgViewerState((prevState) => {
      const newState = { ...prevState, [dataSet]: { ...prevState[dataSet], perspectiveZoom: 200 } };
      return newState;
    });
    handleCloseMenu();
  };

  const handleSynapseToggle = () => {
    setNgViewerState((prevState) => {
      // find the layer that has a name containing 'synapse'
      const tabState = prevState[dataSet];
      const layerOfInterest = tabState.layers.find((layer) => layer.name.includes('synapse'));

      // set the synapse layer to be visible or not visible depending on the current state
      if (layerOfInterest) {
        // if layerOfInterest.visible is missing, set it to be false
        if (layerOfInterest.visible === undefined) {
          layerOfInterest.visible = false;
        } else {
          layerOfInterest.visible = !layerOfInterest.visible;
        }
      }
      const newState = { ...prevState, [dataSet]: tabState };
      return newState;
    });
    handleCloseMenu();
  }

  const handleROIToggle = () => {
    setNgViewerState((prevState) => {
      // find the layer that has a name containing 'ROI'
      const tabState = prevState[dataSet];
      const layerOfInterest = tabState.layers.find((layer) => layer.name.includes('roi'));

      // set the ROI layer to be visible or not visible depending on the current state
      if (layerOfInterest) {
        // if layerOfInterest.visible is missing, set it to be false
        if (layerOfInterest.visible === undefined) {
          layerOfInterest.visible = false;
        } else {
          layerOfInterest.visible = !layerOfInterest.visible;
        }
      }
      const newState = { ...prevState, [dataSet]: tabState };
      return newState;
    });
    handleCloseMenu();
  }

  const handleSkeletonMeshToggle = () => {
    // TODO: implement the skeleton/mesh toggle
    // eslint-disable-next-line no-console
    console.log('handleSkeletonMeshToggle');
  }

  return (
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
      <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem
          aria-label="Reset to default brain view"
          onClick={() => {
            handleResetViewToBrain();
          }}
        >
          <HistoryIcon className={classes.menuIcon} /> Reset to default brain view
        </MenuItem>
        <MenuItem
          aria-label="Reset to default VNC view"
          onClick={() => {
            handleResetViewToVNC();
          }}
        >
          <HistoryIcon className={classes.menuIcon} /> Reset to default VNC view
        </MenuItem>
        <MenuItem
          aria-label="Switch between meshes and skeletons"
          onClick={() => {
            handleSkeletonMeshToggle();
          }}
        >
          <ToggleOffIcon className={classes.menuIcon} /> Switch between meshes and skeletons
        </MenuItem>
        <MenuItem
          aria-label="Toggle synapses"
          onClick={() => {
            handleSynapseToggle();
          }}
        >
          <ToggleOffIcon className={classes.menuIcon} /> Toggle synapses
        </MenuItem>
        <MenuItem
          aria-label="Toggle ROIs"
          onClick={() => {
            handleROIToggle();
          }}
        >
          <ToggleOffIcon className={classes.menuIcon} /> Toggle ROIs
        </MenuItem>
      </Menu>

      <Tooltip title="Open in new window">
        <IconButton
          className={classes.button}
          aria-label="Open in new window"
          onClick={handleOpenInNewWindow}
        >
          <OpenInNewIcon style={{ fontSize: 18 }} />
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
