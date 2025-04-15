import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Modal from '@material-ui/core/Modal';
import Tooltip from '@material-ui/core/Tooltip';
import { SunburstLoader } from 'plugins/support';
import SelectAndCopyText from '../shared/SelectAndCopyText';

import { NgViewerContext } from '../../../contexts/NgViewerContext';


const styles = theme => ({
  icon: {
    marginLeft: '3px',
    marginTop: '3px',
    cursor: 'pointer',
    color: theme.palette.primary.main
  },
  nblink: {
    marginLeft: '3px',
    textDecoration: 'none',
    fontWeight: 'bold',
    color: theme.palette.primary.main
  },
  container: {
    display: 'flex',
    flexDirection: 'row'
  },
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '85%',
    display: 'block',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none'
  }
});

/**
 * Launches actions for opening the skeleton viewer and neuroglancer.
 *
 * @param {string} id
 * @param {string} dataset
 * @param {Object} actions
 */
function show3DView(id, dataset, actions, color) {
  actions.addAndOpen3D(id, dataset, null, color);
}

function BodyId(props) {
  const { children, dataSet, actions, classes, options={skeleton: true, color: null} } = props;
  const [modal, setModal] = useState(false);
  const { ngViewerState, setNgViewerState } = useContext(NgViewerContext);

  function removeBodyFromNGstate(bodyId, dataSet) {
    setNgViewerState((prevState) => {
      const newDatasetState = { ...prevState[dataSet] };
      // if the layers haven't loaded yet, then don't do anything
      if (!newDatasetState.layers) {
        return prevState;
      }

      const layerOfInterest = newDatasetState.layers.find((layer) => layer.name === dataSet);

      if (!layerOfInterest) {
        return prevState;
      }

      // remove the bodyId from the layer segments array
      if (layerOfInterest && layerOfInterest.segments) {
        const updatedSegments = layerOfInterest.segments.filter((id) => id !== bodyId);
        layerOfInterest.segments = updatedSegments;
      }

      const newState = { ...prevState, [dataSet]: newDatasetState };
      return newState;
    });
    // remove the bodyID from the json stored in the url.
    actions.removeBodyFrom3D(bodyId, dataSet);
  }


  function addBodyToNGstate(bodyId, dataSet, color) {
		const maxRetries = 20; // Retry up to 20 times (100ms * 20 = 2 seconds)
		let attempts = 0;

		function tryUpdateState() {
			setNgViewerState((prevState) => {
				const newDatasetState = { ...prevState[dataSet] };
        // If layers haven't loaded, retry
        if (!newDatasetState.layers) {
          if (attempts < maxRetries) {
            attempts++;
            setTimeout(tryUpdateState, 100); // Retry after 100ms
            return prevState;
          }
          return prevState; // Give up after maxRetries
        }

				const layerOfInterest = newDatasetState.layers.find((layer) => layer.name === dataSet);

				if (!layerOfInterest) {
					return prevState;
				}
				// if the bodyIds list hasn't changed, then don't do anything
				if (layerOfInterest && layerOfInterest.segments) {
					if (layerOfInterest.segments.includes(bodyId)) {
						return prevState;
					}
				}

				// merge the new bodyIds into the layer segments array
				if (layerOfInterest) {
					if (layerOfInterest.segments) {
						const bodyIds = [bodyId];
						const updatedSegments = [...new Set([...layerOfInterest.segments, ...bodyIds])];
						updatedSegments.sort((a, b) => a.localeCompare(b));
						layerOfInterest.segments = updatedSegments;
					} else {
						layerOfInterest.segments = [bodyId];
					}
				}

				const newState = { ...prevState, [dataSet]: newDatasetState };
				return newState;
			});
		}
		tryUpdateState();
  }

  function handleRemoveClick() {
    removeBodyFromNGstate(children.toString(), dataSet);
    actions.removeBodyFrom3D(children.toString(), dataSet);
  }

  function handleClick() {
    show3DView(children, dataSet, actions, options.color);
    addBodyToNGstate(children.toString(), dataSet, options.color);
  }


  let segments = [];
  if (ngViewerState[dataSet] && ngViewerState[dataSet].layers && ngViewerState[dataSet].layers.length > 0) {
    // Find the layer that matches the dataSet name
    const layerOfInterest = ngViewerState[dataSet].layers.find((layer) => layer.name === dataSet);
    if (layerOfInterest && layerOfInterest.segments) {
      segments = layerOfInterest.segments;
    }
  }

  const viewIcon = segments.includes(children.toString()) ? (
   <Tooltip title="Remove from 3D View">
      <Icon
        className={classes.icon}
        onClick={() => handleRemoveClick()}
        fontSize="inherit"
      >
        visibility_off
      </Icon>
    </Tooltip>

  ) : (
    <Tooltip title="3D View">
      <Icon
        className={classes.icon}
        onClick={() => handleClick()}
        fontSize="inherit"
      >
        visibility
      </Icon>
    </Tooltip>
  );

  const neuronbridgeLink = `https://neuronbridge.janelia.org/search?q=${dataSet.replace(/:.*$/, '*')}:${children}`;
  return (
    <div>
      <div className={classes.container}>
        <SelectAndCopyText text={children} actions={actions} />
        {options.skeleton ? (viewIcon) : ""}
        <Tooltip title="Synapse Connectivity">
          <Icon className={classes.icon} onClick={() => setModal(!modal)} fontSize="inherit">
            donut_small
          </Icon>
        </Tooltip>
        {/hemibrain|manc/.test(dataSet) && (
          <Tooltip title="NeuronBridge">
            <a className={classes.nblink} href={neuronbridgeLink}>
              NB
            </a>
          </Tooltip>
        )}
      </div>
      <Modal open={modal} onClose={() => setModal(false)}>
        <div className={classes.paper}>
          <SunburstLoader
            bodyId={children}
            dataSet={dataSet}
            onError={actions.metaInfoError}
            actions={actions}
        />
        </div>
      </Modal>
    </div>
  );
}

BodyId.propTypes = {
  children: PropTypes.string.isRequired,
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  options: PropTypes.object
};

export default withStyles(styles)(BodyId);
