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
  },
  colorBox: {
    height: '20px',
    width: '20px',
    border: '1px solid #ccc',
    padding: '1px'
  }
});

const cypherQuery =
  'MATCH (n :`<DATASET>-Neuron` {bodyId: <BODYID>})-[x :ConnectsTo]-(m) RETURN x.weight AS weight, startnode(x).bodyId AS startId, startnode(x).type AS startType, endnode(x).bodyId AS endBody, endnode(x).type AS endType ORDER BY x.weight DESC';

class SynapseSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ids: {},
      loadingError: null
    };
  }

  componentDidMount() {
    const { body, dataSet } = this.props;
    const finalQuery = cypherQuery.replace(/<DATASET>/, dataSet).replace(/<BODYID>/, body.get('name'));
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
    const { body, isInput, actions, synapseState, dataSet, synapseRadius } = this.props;
    // decide if this input/output
    const synapseType = isInput ? 'inputs' : 'outputs';
    if (synapseState.getIn([body.get('name'), synapseType, id])) {
      actions.removeSynapse(body.get('name'), id, isInput);
    } else {
      actions.loadSynapse(body.get('name'), id, dataSet, { isInput, radius: synapseRadius });
    }
  };

  synapsesLoaded(result) {
    const { body, isInput } = this.props;
    // loop over the data and pull out the inputs vs the outputs.
    // store them as separate arrays in the state. They will be used later
    // for the menu when picking which ones to display.

    const { ids } = this.state;

    result.data
      .sort((a, b) => a[0] > b[0]) // sort by weight
      .forEach(synapse => {
        if (isInput) {
          // inputs are anything where the start node is not the current bodyid
          if (synapse[1] !== body.get('name')) {
            ids[synapse[1]] = { weight: synapse[0], type: synapse[2] };
          }
        } else if (!isInput) {
          // outputs are anything where the end node is not the current bodyid
          if (synapse[3] !== body.get('name')) {
            ids[synapse[3]] = { weight: synapse[0], type: synapse[4] };
          }
        }
      });

    this.setState({ ids });
  }

  render() {
    const { isInput, classes, body, synapseState } = this.props;
    const { ids, loadingError } = this.state;

    if (loadingError) {
      return <p>Unable to load synapses for {body.get('name')}</p>;
    }

    const synapseType = isInput ? 'inputs' : 'outputs';

    const synapseStateCheck = isInput
      ? synapseState.getIn([body.get('name'), synapseType], Immutable.Map({}))
      : synapseState.getIn([body.get('name'), synapseType], Immutable.Map({}));

    const inputMenuItems = Object.entries(ids)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0,29)
      .map(entry => {
        const [id, synapseMeta] = entry;
        const checked = Boolean(synapseStateCheck.get(id, false));
        const colorBoxStyle = {
          backgroundColor: synapseState.getIn([body.get('name'), synapseType, id, 'color'])
        };
        return (
          <ListItem key={id}>
            <ListItemText>
              {id}({synapseMeta.type}) {synapseMeta.weight} <div className={classes.colorBox} style={colorBoxStyle} />
            </ListItemText>
            <ListItemSecondaryAction>
              <Switch onChange={() => this.handleToggle(id)} checked={checked} color="primary" />
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
  body: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  synapseState: PropTypes.object.isRequired,
  synapseRadius: PropTypes.number.isRequired,
  actions: PropTypes.object.isRequired
};

export default withStyles(styles)(SynapseSelection);
