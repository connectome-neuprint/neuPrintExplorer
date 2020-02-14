import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';

export default function SynapseUpdater(props) {
  const { synapse, isInput, actions, synapseState, bodyId, dataSet } = props;
  const [id, synapseMeta] = synapse;

  const synapseType = isInput ? 'inputs' : 'outputs';
  const synapseStateCheck = isInput
    ? synapseState.getIn([bodyId, synapseType], Immutable.Map({}))
    : synapseState.getIn([bodyId, synapseType], Immutable.Map({}));

  const visible = synapseStateCheck.get(id, false) ? {} : { color: '#ccc' };
  const colorBoxStyle = {
    backgroundColor: synapseState.getIn([bodyId, synapseType, id, 'color']),
    height: '20px',
    width: '20px',
    border: '1px solid #ccc',
    padding: '1px'
  };

  function handleToggle() {
    // decide if this input/output
    if (synapseState.getIn([bodyId, synapseType, id])) {
      actions.removeSynapse(bodyId, id, isInput);
    } else {
      actions.loadSynapse(bodyId, id, dataSet, { isInput });
    }
  }

  return (
    <ListItem key={id}>
      <ListItemText>
        <Button onClick={handleToggle} style={visible}>
          {id}({synapseMeta.type}) {synapseMeta.weight}{' '}
        </Button>
      </ListItemText>
      <ListItemSecondaryAction>
        <div style={colorBoxStyle} />
      </ListItemSecondaryAction>
    </ListItem>
  );
}

SynapseUpdater.propTypes = {
  synapse: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
  isInput: PropTypes.bool,
  actions: PropTypes.object.isRequired,
  bodyId: PropTypes.string.isRequired,
  dataSet: PropTypes.string.isRequired,
  synapseState: PropTypes.object.isRequired
};

SynapseUpdater.defaultProps = {
  isInput: false
};
