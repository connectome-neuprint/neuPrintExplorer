import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Modal from '@material-ui/core/Modal';
import Tooltip from '@material-ui/core/Tooltip';
import { SunburstLoader } from 'plugins/support';
import SelectAndCopyText from '../shared/SelectAndCopyText';

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
  const neuronbridgeLink = `https://neuronbridge.janelia.org/search?q=${dataSet.replace(/:.*$/, '*')}:${children}`;
  return (
    <div>
      <div className={classes.container}>
        <SelectAndCopyText text={children} actions={actions} />
        {options.skeleton ? (
        <Tooltip title="3D View">
          <Icon
            className={classes.icon}
            onClick={() => show3DView(children, dataSet, actions, options.color)}
            fontSize="inherit"
          >
            visibility
          </Icon>
        </Tooltip>) : ""}
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
  children: PropTypes.number.isRequired,
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  options: PropTypes.object
};

export default withStyles(styles)(BodyId);
