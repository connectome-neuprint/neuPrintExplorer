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
import { setUrlQS } from 'actions/app';
import { getQueryString } from 'helpers/queryString';
import NeuronFilter from '../NeuronFilter';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
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

  static get isExperimental() {
    return true;
  }

  constructor(props) {
    super(props);
    const initqsParams = {
      typeValue: 'input',
      bodyIds: '',
      names: ''
    };
    const qsParams = LoadQueryString(
      `Query:${this.constructor.queryName}`,
      initqsParams,
      props.urlQueryString
    );

    this.state = {
      qsParams,
      limitNeurons: true,
      statusFilters: [],
      preThreshold: 0,
      postThreshold: 0
    };
  }

  processResults = (query, apiResponse) => {
    const { parameters } = query;

    const queryKey = parameters.find_inputs ? 'input' : 'output';
    const connectionArray = apiResponse.data[0][0];

    const columns = [
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} BodyId`,
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} Name`
    ];

    const groupBy = (inputJson, key) =>
      inputJson.reduce((accumulator, currentValue) => {
        // name of the common input/output
        const { name } = currentValue;
        // first element of the keys array is X_weight where X is the body id of a queried neuron
        let weights = Object.keys(currentValue)[0];
        // in case order of keys changes check that this is true and if not find the correct key
        if (!weights.endsWith('weight')) {
          for (let i = 1; i < Object.keys(currentValue).length; i += 1) {
            if (Object.keys(currentValue)[i].endsWith('weight')) {
              weights = Object.keys(currentValue)[i];
              break;
            }
          }
        }
        (accumulator[currentValue[key]] = accumulator[currentValue[key]] || {})[weights] =
          currentValue[weights];
        accumulator[currentValue[key]].name = name;
        return accumulator;
      }, {});

    const groupedByInputOrOutputId = groupBy(connectionArray, queryKey);

    let selectedNeurons = [];
    if (parameters.neuron_ids.length > 0) {
      selectedNeurons = parameters.neuron_ids;
    } else {
      selectedNeurons = parameters.neuron_names;
    }

    const selectedWeightHeadings = selectedNeurons.map(neuron => `${neuron}_weight`);
    selectedWeightHeadings.forEach(neuronWeightHeading => {
      columns.push(neuronWeightHeading);
    });

    const data = [];
    Object.keys(groupedByInputOrOutputId).forEach(inputOrOutput => {
      const singleRow = [parseInt(inputOrOutput, 10), groupedByInputOrOutputId[inputOrOutput].name];
      selectedWeightHeadings.forEach(selectedWeightHeading => {
        const selectedWeightValue =
          groupedByInputOrOutputId[inputOrOutput][selectedWeightHeading] || 0;
        singleRow.push(parseInt(selectedWeightValue, 10));
      });
      data.push(singleRow);
    });

    return {
      columns,
      data,
      debug: apiResponse.debug
    };
  };

  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { qsParams, limitNeurons, preThreshold, postThreshold, statusFilters } = this.state;
    const { bodyIds, names, typeValue } = qsParams;

    const parameters = {
      dataset: dataSet,
      statuses: statusFilters,
      find_inputs: typeValue !== 'output',
      neuron_ids: bodyIds === '' ? [] : bodyIds.split(',').map(Number),
      neuron_names: names === '' ? [] : names.split(','),
      all_segments: !limitNeurons
    };

    if (preThreshold > 0) {
      parameters.pre_threshold = preThreshold;
    }

    if (postThreshold > 0) {
      parameters.post_threshold = postThreshold;
    }

    const selectedNeurons =
      parameters.neuron_ids.length > 0 ? parameters.neuron_ids : parameters.neuron_names;

    const query = {
      dataSet,
      queryString: '/npexplorer/commonconnectivity',
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters,
      title: `Common ${qsParams.typeValue}s for ${selectedNeurons} in ${dataSet}`,
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
      limitNeurons: params.limitNeurons,
      statusFilters: params.statusFilters,
      preThreshold: parseInt(params.preThreshold, 10),
      postThreshold: parseInt(params.postThreshold, 10)
    });
  };

  addNeuronBodyIds = event => {
    const { qsParams } = this.state;
    const { actions } = this.props;
    const oldParams = qsParams;
    oldParams.bodyIds = event.target.value;
    actions.setURLQs(SaveQueryString(`Query:${this.constructor.queryName}`, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  addNeuronNames = event => {
    const { qsParams } = this.state;
    const { actions } = this.props;
    const oldParams = qsParams;
    oldParams.names = event.target.value;
    actions.setURLQs(SaveQueryString(`Query:${this.constructor.queryName}`, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  setInputOrOutput = event => {
    const { qsParams } = this.state;
    const { actions } = this.props;
    const oldParams = qsParams;
    oldParams.typeValue = event.target.value;
    actions.setURLQs(SaveQueryString(`Query:${this.constructor.queryName}`, oldParams));
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
    const { classes, dataSet } = this.props;
    const { qsParams } = this.state;
    return (
      <div>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Neuron bodyIds"
            multiline
            fullWidth
            rows={1}
            value={qsParams.bodyIds}
            disabled={qsParams.names.length > 0}
            rowsMax={4}
            helperText="Separate ids with commas."
            onChange={this.addNeuronBodyIds}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
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
            value={qsParams.typeValue}
            onChange={this.setInputOrOutput}
          >
            <FormControlLabel value="input" control={<Radio color="primary" />} label="Inputs" />
            <FormControlLabel value="output" control={<Radio color="primary" />} label="Outputs" />
          </RadioGroup>
        <NeuronFilter callback={this.loadNeuronFilters} datasetstr={dataSet} />
        <Button variant="contained" color="primary" onClick={this.processRequest}>
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

const CommonConnectivityState = state => ({
  urlQueryString: state.app.get('urlQueryString')
});

const CommonConnectivityDispatch = dispatch => ({
  actions: {
    setURLQs(querystring) {
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
