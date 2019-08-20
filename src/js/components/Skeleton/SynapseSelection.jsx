import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  synapseList: {
    height: '320px',
    overflow: 'auto'
  }
});

const cypherQuery =
  'MATCH (n :`<DATASET>-Neuron` {bodyId: <BODYID>})-[x :ConnectsTo]-(m) RETURN x.weight AS weight, startnode(x).bodyId AS startId, startnode(x).type AS startType, endnode(x).bodyId AS endBody, endnode(x).type AS endType ORDER BY x.weight DESC';

class SynapseSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ids: new Set(),
      loadingError: null
    };
  }

  componentDidMount() {
    const { bodyId, dataSet } = this.props;
    const finalQuery = cypherQuery.replace(/<DATASET>/, dataSet).replace(/<BODYID>/, bodyId);
    fetch('/api/custom/custom', {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        cypher: finalQuery
      }),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(result => {
        if ('error' in result) {
          throw result.error;
        }
        this.synapsesLoaded(result);
      })
      .catch(error => this.setState({ loadingError: error }));
  }

  handleToggle = id => {
    const { bodyId, isInput, actions } = this.props;
    // decide if this input/output
    // set the state to show that the id has been selected.
    actions.toggleSynapse(bodyId, id, isInput);
  };

  synapsesLoaded(result) {
    const { bodyId, isInput } = this.props;
    // loop over the data and pull out the inputs vs the outputs.
    // store them as separate arrays in the state. They will be used later
    // for the menu when picking which ones to display.

    const ids = new Set();

    result.data.forEach(synapse => {
      if (isInput) {
        // inputs are anything where the start node is not the current bodyid
        if (synapse[1] !== bodyId) {
          ids.add(synapse[1]);
        }
      } else if (!isInput) {
        // outputs are anything where the end node is not the current bodyid
        if (synapse[3] !== bodyId) {
          ids.add(synapse[3]);
        }
      }
    });

    this.setState({ ids });
  }

  render() {
    const { isInput, classes, bodyId, synapseState } = this.props;
    const { ids, loadingError } = this.state;

    if (loadingError) {
      return <p>Unable to load synapses for {bodyId}</p>;
    }

    const synapseStateCheck = isInput
      ? synapseState.getIn([bodyId, 'inputs'], Immutable.Map({}))
      : synapseState.getIn([bodyId, 'outputs'], Immutable.Map({}));

    const inputMenuItems = [...ids].map(id => {
      const checked = synapseStateCheck.get(id, false);
      return (
        <ListItem key={id}>
          <ListItemText>{id}</ListItemText>
          <ListItemSecondaryAction>
            <Switch onChange={() => this.handleToggle(id)} checked={checked} />
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return (
      <React.Fragment>
        <Typography variant="subtitle2">{isInput ? 'Inputs:' : 'Outputs:'}</Typography>
        <List className={classes.synapseList}>{inputMenuItems}</List>
      </React.Fragment>
    );
  }
}

SynapseSelection.propTypes = {
  isInput: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  bodyId: PropTypes.number.isRequired,
  dataSet: PropTypes.string.isRequired,
  synapseState: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default withStyles(styles)(SynapseSelection);
