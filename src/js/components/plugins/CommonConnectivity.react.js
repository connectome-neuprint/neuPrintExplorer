/*
 * Queries common inputs/outputs given list of bodyIds 
*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';

import { submit } from 'actions/plugins';
import NeuronFilter from '../NeuronFilter.react';
import { setUrlQS } from 'actions/app';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import { getQueryString } from 'helpers/queryString';

const styles = theme => ({
  textField: {
    minWidth: 250,
    maxWidth: 300
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 250,
    maxWidth: 300
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  }
});

const pluginName = 'CommonConnectivity';
class CommonConnectivity extends React.Component {
  static get queryName() {
    return 'Common connectivity';
  }

  static get queryDescription() {
    return 'Finds common inputs/outputs for a group of bodies and weights of their connections to these inputs/outputs.';
  }

  constructor(props) {
    super(props);
    const initqsParams = {
      typeValue: 'input',
      bodyIds: '',
      names: ''
    };
    const qsParams = LoadQueryString(
      'Query:' + this.constructor.queryName,
      initqsParams,
      this.props.urlQueryString
    );

    this.state = {
      qsParams: qsParams,
      limitBig: true
    };
  }

  processResults = (query, apiResponse) => {
    const { parameters } = query;

    const queryKey = parameters.find_inputs ? 'input' : 'output';
    const connectionArray = apiResponse.data[0][0];

    const columns = [
      queryKey[0].toUpperCase() + queryKey.substring(1) + ' BodyId',
      queryKey[0].toUpperCase() + queryKey.substring(1) + ' Name'
    ];

    const groupBy = function(inputJson, key) {
      return inputJson.reduce(function(accumulator, currentValue) {
        //name of the common input/output
        const name = currentValue['name'];
        //first element of the keys array is X_weight where X is the body id of a queried neuron
        let weights = Object.keys(currentValue)[0];
        // in case order of keys changes check that this is true and if not find the correct key
        if (!weights.endsWith('weight')) {
          for (let i = 1; i < Object.keys(currentValue).length; i++) {
            if (Object.keys(currentValue)[i].endsWith('weight')) {
              weights = Object.keys(currentValue)[i];
              break;
            }
          }
        }
        (accumulator[currentValue[key]] = accumulator[currentValue[key]] || {})[weights] =
          currentValue[weights];
        accumulator[currentValue[key]]['name'] = name;
        return accumulator;
      }, {});
    };

    const groupedByInputOrOutputId = groupBy(connectionArray, queryKey);

    let selectedNeurons = [];
    if (parameters.neuron_ids.length > 0) {
      selectedNeurons = parameters.neuron_ids;
    } else {
      selectedNeurons = parameters.neuron_names;
    }

    const selectedWeightHeadings = selectedNeurons.map(neuron => neuron + '_weight');
    selectedWeightHeadings.forEach(function(neuronWeightHeading) {
      columns.push(neuronWeightHeading);
    });

    const data = [];
    Object.keys(groupedByInputOrOutputId).forEach(inputOrOutput => {
      let singleRow = [parseInt(inputOrOutput), groupedByInputOrOutputId[inputOrOutput]['name']];
      selectedWeightHeadings.forEach(function(selectedWeightHeading) {
        const selectedWeightValue =
          groupedByInputOrOutputId[inputOrOutput][selectedWeightHeading] || 0;
        singleRow.push(parseInt(selectedWeightValue));
      });
      data.push(singleRow);
    });

    return {
      columns: columns,
      data,
      debug: apiResponse.debug
    };
  };

  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { qsParams, statusFilters, limitBig } = this.state;

    const parameters = {
      dataset: dataSet,
      statuses: statusFilters,
      find_inputs: qsParams.typeValue !== 'output',
      neuron_ids: qsParams.bodyIds === '' ? [] : qsParams.bodyIds.split(',').map(Number),
      neuron_names: qsParams.names === '' ? [] : qsParams.names.split(',')
    };

    if (limitBig) {
      parameters.pre_threshold = 2;
    }

    const selectedNeurons =
      parameters.neuron_ids.length > 0 ? parameters.neuron_ids : parameters.neuron_names;

    const query = {
      dataSet,
      queryString: '/npexplorer/commonconnectivity',
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters,
      title: 'Common ' + qsParams.typeValue + 's for ' + selectedNeurons + ' in ' + dataSet,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };

    actions.submit(query);
    // redirect to the results page.
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
  };

  loadNeuronFilters = params => {
    this.setState({
      limitBig: params.limitBig,
      statusFilters: params.statusFilters
    });
  };

  addNeuronBodyIds = event => {
    const oldParams = this.state.qsParams;
    oldParams.bodyIds = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  addNeuronNames = event => {
    const oldParams = this.state.qsParams;
    oldParams.names = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  setInputOrOutput = event => {
    const oldParams = this.state.qsParams;
    oldParams.typeValue = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processRequest();
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            label="Neuron bodyIds"
            multiline
            fullWidth
            rows={1}
            value={this.state.qsParams.bodyIds}
            disabled={this.state.qsParams.names.length > 0}
            rowsMax={4}
            className={classes.textField}
            helperText="Separate ids with commas."
            onChange={this.addNeuronBodyIds}
            onKeyDown={this.catchReturn}
          />
          {/* // removing for now  */}
          {/* <TextField
            label="Neuron names"
            multiline
            fullWidth
            rows={1}
            value={this.state.qsParams.names}
            disabled={this.state.qsParams.bodyIds.length > 0}
            rowsMax={4}
            className={classes.textField}
            helperText="Separate names with commas."
            onChange={this.addNeuronNames}
            onKeyDown={this.catchReturn}
          /> */}
          <RadioGroup
            aria-label="Type Of Connections"
            name="type"
            value={this.state.qsParams.typeValue}
            onChange={this.setInputOrOutput}
          >
            <FormControlLabel value="input" control={<Radio />} label="Inputs" />
            <FormControlLabel value="output" control={<Radio />} label="Outputs" />
          </RadioGroup>
        </FormControl>
        <NeuronFilter callback={this.loadNeuronFilters} datasetstr={this.props.datasetstr} />
        <Button variant="contained" onClick={this.processRequest}>
          Submit
        </Button>
      </div>
    );
  }
}

CommonConnectivity.propTypes = {
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const CommonConnectivityState = function(state) {
  return {
    urlQueryString: state.app.get('urlQueryString')
  };
};

const CommonConnectivityDispatch = dispatch => ({
  actions: {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    },
    submit: query => {
      dispatch(submit(query));
    }
  }
});

export default withRouter(
  withStyles(styles, { withTheme: true })(
    connect(
      CommonConnectivityState,
      CommonConnectivityDispatch
    )(CommonConnectivity)
  )
);
