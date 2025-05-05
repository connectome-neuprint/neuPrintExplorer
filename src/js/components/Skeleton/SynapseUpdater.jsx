import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import { withStyles } from '@material-ui/core/styles';

import ColorPickerModal from './ColorPickerModal';

const styles = () => ({
  bodyIdText: {
    fontSize: '0.8em'
  }
});

function SynapseUpdater(props) {
  const {
    synapse,
    isInput,
    actions,
    synapseState,
    bodyId,
    dataSet,
    synapseRadius,
    classes
  } = props;
  const [id, synapseMeta] = synapse;

  const synapseType = isInput ? 'inputs' : 'outputs';
  const synapseStateCheck = isInput
    ? synapseState.getIn([bodyId, synapseType], Immutable.Map({}))
    : synapseState.getIn([bodyId, synapseType], Immutable.Map({}));

  const visible = synapseStateCheck.get(id, false) ? {} : { color: '#ccc' };

  const  handleToggle = () => {
    // decide if this input/output
    if (synapseState.getIn([bodyId, synapseType, id])) {
      actions.removeSynapse(bodyId, id, isInput);
    } else {
      actions.loadSynapse(bodyId, id, dataSet, { isInput, radius: synapseRadius });
    }
  }

  const handleChangeColor = (unusedId, color) => {
    if (!synapseState.getIn([bodyId, synapseType, id])) {
      actions.loadSynapse(bodyId, id, dataSet, { isInput, radius: synapseRadius, color });
    } else {
      actions.updateSynapseColor(bodyId, id, { isInput, color });
    }
  }

  return (
    <ListItem key={id}>
      <ListItemText>
        <Button onClick={handleToggle} style={visible}>
          {synapseMeta.type} - <span className={classes.bodyIdText}>{id}</span>
        </Button>
      </ListItemText>
      {synapseMeta.weight}
      <ColorPickerModal
        bodyId={id}
        currentColor={synapseState.getIn([bodyId, synapseType, id, 'color'])}
        handleChangeColor={handleChangeColor}
      />
    </ListItem>
  );
}

export default withStyles(styles)(SynapseUpdater);

SynapseUpdater.propTypes = {
  synapse: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
  isInput: PropTypes.bool,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  bodyId: PropTypes.string.isRequired,
  dataSet: PropTypes.string.isRequired,
  synapseState: PropTypes.object.isRequired,
  synapseRadius: PropTypes.number.isRequired
};

SynapseUpdater.defaultProps = {
  isInput: false
};
