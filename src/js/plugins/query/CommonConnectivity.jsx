/*
 * Queries common inputs/outputs given list of bodyIds
 */
import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';

import NeuronFilterNew, {
  convertToCypher,
  thresholdCypher,
  statusCypher
} from './shared/NeuronFilterNew';
import { getBodyIdForTable } from './shared/pluginhelpers';

const styles = theme => ({
  formControl: {
    margin: theme.spacing(1)
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap'
  }
});

const pluginName = 'CommonConnectivity';
const pluginAbbrev = 'cc';

const groupBy = (inputJson, key) =>
  inputJson.reduce((accumulator, currentValue) => {
    // name of the common input/output
    const { name, type } = currentValue;
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
    accumulator[currentValue[key]].type = type;
    return accumulator;
  }, {});

class CommonConnectivity extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Common connectivity',
      abbr: pluginAbbrev,
      description:
        'Finds common inputs/outputs for a group of bodies and weights of their connections to these inputs/outputs.',
      visType: 'SimpleTable'
    };
  }

  static getColumnHeaders(query) {
    const { pm: parameters } = query;

    const queryKey = parameters.find_inputs ? 'input' : 'output';

    const columns = [
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} ID`,
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} Instance`,
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} Type`
    ];

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

    columns.push('Total Weight');

    return columns.map(column => ({ name: column, status: true }));
  }

  static fetchParameters(params) {
    const filters = params.filters ? Object.entries(params.filters).map(([filterName, value]) => (
      convertToCypher(filterName, Array.isArray(value) ? value : [value])
    )) : [];
    const conditions = [
      thresholdCypher('pre', params.pre),
      thresholdCypher('post', params.post),
      statusCypher(params.statuses),
      ...filters
    ].filter(condition => condition !== '').join(' AND ');

    const hasConditions = conditions.length > 0 ? 'AND' : '';

    const neuronIds = params.neuron_ids ? params.neuron_ids.join(', ') : '';

    const matchCypher = params.find_inputs ? '(k:Neuron)<-[r:ConnectsTo]-(neuron)' : '(k:Neuron)-[r:ConnectsTo]->(neuron)'

    const cypherQuery = `WITH [${neuronIds}] AS queriedNeurons
MATCH ${matchCypher}
WHERE (k.bodyId IN queriedNeurons ${hasConditions} ${conditions})
WITH k, neuron, r, toString(k.bodyId)+"_weight" AS dynamicWeight
RETURN collect(apoc.map.fromValues(["${params.find_inputs ? "input" : "output"}",
      toString(neuron.bodyId),
      "name",
      neuron.instance,
      "type",
      neuron.type,
      dynamicWeight,
      r.weight])) AS map`;

    return {
      cypherQuery,
      queryString: '/custom/custom?np_explorer=commmon_connectivity'
    };
  }

  static processDownload(response) {
    const {
      find_inputs: findInputs,
      neuron_ids: neuronIds,
      neuron_names: neuronNames
    } = response.params.pm;

    const queryKey = findInputs ? 'input' : 'output';
    const connectionArray = response.result.data[0][0];

    const columnHeaders = [
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} ID`,
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} Instance`,
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} Type`
    ];

    const groupedByInputOrOutputId = groupBy(connectionArray, queryKey);

    let selectedNeurons = [];
    if (neuronIds.length > 0) {
      selectedNeurons = neuronIds;
    } else {
      selectedNeurons = neuronNames;
    }

    const selectedWeightHeadings = selectedNeurons.map(neuron => `${neuron}_weight`);
    selectedWeightHeadings.forEach(neuronWeightHeading => {
      columnHeaders.push(neuronWeightHeading);
    });

    columnHeaders.push('Total Weight');

    const data = [];
    Object.keys(groupedByInputOrOutputId).forEach(inputOrOutput => {
      const singleRow = [
        inputOrOutput,
        groupedByInputOrOutputId[inputOrOutput].name,
        groupedByInputOrOutputId[inputOrOutput].type
      ];

      let totalWeight = 0;
      selectedWeightHeadings.forEach(selectedWeightHeading => {
        const selectedWeightValue =
          groupedByInputOrOutputId[inputOrOutput][selectedWeightHeading] || 0;
        singleRow.push(parseInt(selectedWeightValue, 10));
        totalWeight += parseInt(selectedWeightValue, 10);
      });
      // calculate the total weight for this row.
      singleRow.push(totalWeight);
      data.push(singleRow);
    });

    data.unshift(columnHeaders);
    return data;
  }

  static processResults({ query, apiResponse, actions }) {
    const { pm: parameters } = query;

    const queryKey = parameters.find_inputs ? 'input' : 'output';
    const connectionArray = apiResponse.data[0][0];

    const columns = [
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} ID`,
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} Instance`,
      `${queryKey[0].toUpperCase() + queryKey.substring(1)} Type`
    ];

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

    columns.push('Total Weight');

    const data = [];
    Object.keys(groupedByInputOrOutputId).forEach(inputOrOutput => {
      const singleRow = [
        getBodyIdForTable(query.ds, inputOrOutput, actions),
        groupedByInputOrOutputId[inputOrOutput].name,
        groupedByInputOrOutputId[inputOrOutput].type
      ];
      let totalWeight = 0;
      selectedWeightHeadings.forEach(selectedWeightHeading => {
        const selectedWeightValue =
          groupedByInputOrOutputId[inputOrOutput][selectedWeightHeading] || 0;
        singleRow.push(parseInt(selectedWeightValue, 10));
        totalWeight += parseInt(selectedWeightValue, 10);
      });
      // calculate the total weight for this row.
      singleRow.push(totalWeight);
      data.push(singleRow);
    });

    return {
      columns,
      data,
      debug: apiResponse.debug,
      title: `Common ${queryKey}s for ${selectedNeurons} in ${parameters.dataset}`
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      limitNeurons: true,
      status: [],
      pre: 0,
      post: 0,
      filters: {},
      bodyIds: '',
      typeValue: 'input'
    };
  }

  processRequest = () => {
    const { dataSet, submit, actions } = this.props;
    const { limitNeurons, pre, post, status, filters } = this.state;
    const { bodyIds, typeValue } = this.state;

    const parameters = {
      dataset: dataSet,
      statuses: status,
      find_inputs: typeValue !== 'output',
      neuron_ids: bodyIds === '' ? [] : bodyIds.split(','),
      all_segments: !limitNeurons
    };

    if (parameters.neuron_ids.length > 100) {
      actions.metaInfoError(
        `You entered ${
          parameters.neuron_ids.length
        } Neuron IDs. Please limit the list to 100 or less`
      );
      return;
    }

    if (parameters.neuron_ids.length < 1) {
      actions.metaInfoError("You must enter at least one Neuron ID.");
      return;
    }

    if (pre > 0) {
      parameters.pre = pre;
    }

    if (post > 0) {
      parameters.post = post;
    }

    if (Object.keys(filters).length > 0) {
      parameters.filters = filters;
    }

    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters
    };

    submit(query);
  };

  loadNeuronFiltersNew = filters => {
    this.setState({
      filters
    });
  };

  addNeuronBodyIds = event => {
    this.setState({
      bodyIds: event.target.value
    });
  };

  setInputOrOutput = event => {
    this.setState({ typeValue: event.target.value });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processRequest();
    }
  };

  render() {
    const { classes, dataSet, actions, neoServerSettings } = this.props;
    const { bodyIds, typeValue } = this.state;

    return (
      <div>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Neuron IDs"
            multiline
            fullWidth
            rows={1}
            value={bodyIds}
            name="bodyIds"
            rowsMax={4}
            helperText="Separate IDs with commas. Max 100"
            onChange={this.addNeuronBodyIds}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        <RadioGroup
          aria-label="Type Of Connections"
          name="type"
          value={typeValue}
          onChange={this.setInputOrOutput}
        >
          <FormControlLabel value="input" control={<Radio color="primary" />} label="Inputs" />
          <FormControlLabel value="output" control={<Radio color="primary" />} label="Outputs" />
        </RadioGroup>
        <NeuronFilterNew
          callback={this.loadNeuronFiltersNew}
          datasetstr={dataSet}
          actions={actions}
          neoServer={neoServerSettings.get('neoServer')}
        />
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
  submit: PropTypes.func.isRequired,
  neoServerSettings: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(CommonConnectivity);
