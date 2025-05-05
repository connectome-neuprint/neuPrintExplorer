import React from 'react';
import PropTypes from 'prop-types';

import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  button: {
    margin: '0.3em 0 0.3em 0.5em'
  }
});


function ToggleSynapses(props) {

  const { synapseList, isInput, actions, synapseState, dataSet, synapseRadius, bodyId, classes } = props;

  const synapseType = isInput ? 'inputs' : 'outputs';

  const handleShow = () => {
    synapseList.forEach(id => {
      if (!synapseState.getIn([bodyId, synapseType, id])) {
        actions.loadSynapse(bodyId, id, dataSet, { isInput, radius: synapseRadius });
      }
    });
  }

  const handleHide = () => {
    synapseList.forEach(id => {
      actions.removeSynapse(bodyId, id, isInput);
    });
  }


  return (
    <ListItem>
      <Button className={classes.button} onClick={handleShow} variant="outlined" color="primary">Show All</Button>
      <Button className={classes.button} onClick={handleHide} variant="outlined" color="primary">Hide All</Button>
    </ListItem>
  );
}

ToggleSynapses.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  synapseState: PropTypes.object.isRequired,
  synapseList: PropTypes.arrayOf(PropTypes.string).isRequired,
  dataSet: PropTypes.string.isRequired,
  bodyId: PropTypes.string.isRequired,
  synapseRadius: PropTypes.number.isRequired,
  isInput: PropTypes.bool
};

ToggleSynapses.defaultProps = {
  isInput: true
}

export default withStyles(styles)(ToggleSynapses);
