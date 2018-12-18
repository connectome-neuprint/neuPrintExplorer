/*
 * Supports simple, custom neo4j query.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import randomColor from 'randomcolor';
import { withRouter } from 'react-router';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';

import { submit, formError } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';
import NeuronHelp from '../NeuronHelp';

const styles = () => ({
  textField: {},
  formControl: {
    margin: '0.5em 0 1em 0',
    width: '100%'
  },
  badge: {
    right: '-10px',
    width: '100px',
    height: '50px',
    top: '-10px'
  }
});

const pluginName = 'SimpleConnection';

class SimpleConnections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      neuronName: '',
      preOrPost: 'pre'
    };
  }

  static get queryName() {
    return 'Simple Connections';
  }

  static get queryDescription() {
    return 'List inputs or outputs to selected neuron(s)';
  }

  static get isExperimental() {
    return true;
  }

  processResults = (query, apiResponse) => {
    const tables = [];
    const columnNames = ['ID', 'Name', 'Weight'];

    let currentTable = [];
    let lastBody = -1;
    let lastName = '';

    apiResponse.data.forEach(row => {
      const neuron1Id = row[4];
      if (lastBody !== -1 && neuron1Id !== lastBody) {
        let tableName = `${lastName} id=(${String(lastBody)})`;
        if (query.parameters.find_inputs === false) {
          tableName = `${tableName} => ...`;
        } else {
          tableName = `... => ${tableName}`;
        }

        tables.push({
          columns: columnNames,
          data: currentTable,
          name: tableName
        });
        currentTable = [];
      }
      lastBody = neuron1Id;
      [lastName] = row;

      let neuron2Name = row[1];
      if (neuron2Name === null) {
        neuron2Name = '';
      }
      currentTable.push([row[2], neuron2Name, row[3]]);
    });

    if (lastBody !== -1) {
      let tableName = `${lastName} id=(${String(lastBody)})`;
      if (query.parameters.find_inputs === false) {
        tableName = `${tableName} => ...`;
      } else {
        tableName = `... => ${tableName}`;
      }

      tables.push({
        columns: columnNames,
        data: currentTable,
        name: tableName
      });
    }

    return {
      data: tables,
      debug: apiResponse.debug
    };
  };

  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { neuronName, preOrPost } = this.state;
    if (neuronName !== '') {
      const parameters = { dataset: dataSet };
      if (/^\d+$/.test(neuronName)) {
        parameters.neuron_id = parseInt(neuronName, 10);
      } else {
        parameters.neuron_name = neuronName;
      }
      if (preOrPost === 'pre') {
        parameters.find_inputs = false;
      } else {
        parameters.find_inputs = true;
      }
      const query = {
        dataSet,
        queryString: '/npexplorer/simpleconnections',
        visType: 'CollapsibleTable',
        plugin: pluginName,
        parameters,
        title: `${preOrPost}-synaptic connections to ${neuronName}`,
        menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
        processResults: this.processResults
      };

      actions.submit(query);
      history.push({
        pathname: '/results',
        search: getQueryString()
      });
    } else {
      actions.formError('Please enter a neuron name.');
    }
  };

  handleNeuronName = event => {
    this.setState({ neuronName: event.target.value });
  };

  handleDirection = event => {
    this.setState({ preOrPost: event.target.value });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processRequest();
    }
  };

  render() {
    const { classes, isQuerying } = this.props;
    const { preOrPost, neuronName } = this.state;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name"
              multiline
              fullWidth
              rows={1}
              value={neuronName}
              rowsMax={4}
              className={classes.textField}
              onChange={this.handleNeuronName}
              onKeyDown={this.catchReturn}
            />
          </NeuronHelp>
        </FormControl>
        <FormControl className={classes.formControl}>
          <FormLabel component="legend">Neuron Direction</FormLabel>
          <RadioGroup
            aria-label="preOrPost"
            name="preOrPost"
            className={classes.group}
            value={preOrPost}
            onChange={this.handleDirection}
          >
            <FormControlLabel
              value="pre"
              control={<Radio color="primary" />}
              label="Pre-synaptic"
            />
            <FormControlLabel
              value="post"
              control={<Radio color="primary" />}
              label="Post-synaptic"
            />
          </RadioGroup>
        </FormControl>
        <Button
          variant="contained"
          disabled={isQuerying}
          color="primary"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

SimpleConnections.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  dataSet: PropTypes.string.isRequired
};

const SimpleConnectionsState = state => ({
  isQuerying: state.query.isQuerying
});

const SimpleConnectionsDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    formError: query => {
      dispatch(formError(query));
    }
  }
});

export default withRouter(
  withStyles(styles)(
    connect(
      SimpleConnectionsState,
      SimpleConnectionsDispatch
    )(SimpleConnections)
  )
);
