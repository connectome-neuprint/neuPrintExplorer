import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Icon from '@mui/material/Icon';
import Modal from '@mui/material/Modal';
import Tooltip from '@mui/material/Tooltip';
import { SunburstLoader } from 'plugins/support';
import SelectAndCopyText from '../shared/SelectAndCopyText';

import { NgViewerContext } from '../../../contexts/NgViewerContext';


const styles = theme => ({
  icon: {
    marginLeft: '3px',
    marginTop: '3px',
    cursor: 'pointer',
    fontSize: '1em',
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

  // Both updaters replace the layer rather than editing it in place.
  // react-neuroglancer decides whether to push state into the viewer by
  // comparing serialised state, so an in-place edit is invisible to it: the
  // previous and next props end up referencing the same mutated layer object
  // and the update is dropped.
  function withUpdatedSegments(datasetState, dataSet, segments) {
    return {
      ...datasetState,
      layers: datasetState.layers.map((layer) =>
        layer.name === dataSet ? { ...layer, segments } : layer
      ),
    };
  }

  function removeBodyFromNGstate(bodyId, dataSet) {
    setNgViewerState((prevState) => {
      const datasetState = prevState[dataSet];
      // if the layers haven't loaded yet, then don't do anything
      if (!datasetState || !datasetState.layers) {
        return prevState;
      }

      const layerOfInterest = datasetState.layers.find((layer) => layer.name === dataSet);

      if (!layerOfInterest || !layerOfInterest.segments) {
        return prevState;
      }

      // remove the bodyId from the layer segments array
      const segments = layerOfInterest.segments.filter((id) => id !== bodyId);
      if (segments.length === layerOfInterest.segments.length) {
        return prevState;
      }

      return { ...prevState, [dataSet]: withUpdatedSegments(datasetState, dataSet, segments) };
    });
    // remove the bodyID from the json stored in the url.
    actions.removeBodyFrom3D(bodyId, dataSet);
  }

  function addBodyToNGstate(bodyId, dataSet) {
    const maxRetries = 20; // Retry up to 20 times (100ms * 20 = 2 seconds)
    let attempts = 0;

    function tryUpdateState() {
      setNgViewerState((prevState) => {
        const datasetState = prevState[dataSet];
        // If layers haven't loaded, retry
        if (!datasetState || !datasetState.layers) {
          if (attempts < maxRetries) {
            attempts += 1;
            setTimeout(tryUpdateState, 100); // Retry after 100ms
          }
          return prevState; // Give up after maxRetries
        }

        const layerOfInterest = datasetState.layers.find((layer) => layer.name === dataSet);

        if (!layerOfInterest) {
          return prevState;
        }

        // if the bodyIds list hasn't changed, then don't do anything
        const currentSegments = layerOfInterest.segments || [];
        if (currentSegments.includes(bodyId)) {
          return prevState;
        }

        // merge the new bodyId into the layer segments array
        const segments = [...new Set([...currentSegments, bodyId])];
        segments.sort((a, b) => a.localeCompare(b));

        return { ...prevState, [dataSet]: withUpdatedSegments(datasetState, dataSet, segments) };
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
    addBodyToNGstate(children.toString(), dataSet);
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
        fontSize="small"
      >
        visibility_off
      </Icon>
    </Tooltip>

  ) : (
    <Tooltip title="3D View">
      <Icon
        className={classes.icon}
        onClick={() => handleClick()}
        fontSize="small"
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
          <Icon className={classes.icon} onClick={() => setModal(!modal)} fontSize="small">
            donut_small
          </Icon>
        </Tooltip>
        {/hemibrain|manc|male-cns/.test(dataSet) && (
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
