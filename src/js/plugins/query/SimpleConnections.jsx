/*
 * Supports simple, custom neo4j query.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { withStyles } from '@material-ui/core/styles';

import NeuronInputField from './shared/NeuronInputField';
import AdvancedNeuronInput from './shared/AdvancedNeuronInput';
import { pluginName, pluginAbbrev } from './shared/SimpleConnectionsConstants';
import { createSimpleConnectionsResult } from './shared/pluginhelpers';

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


export class SimpleConnections extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Simple Connections',
      abbr: pluginAbbrev,
      category: 'top-level',
      description: 'List inputs or outputs to selected neuron(s)',
      visType: 'SimpleConnectionsView'
    };
  }

  static clipboardCallback = apiResponse => columns => {
    const csv = apiResponse.result.data
      .map(table => {
        const rowsByTable = table.data.map(row => {
          const filteredRow = columns
            .map((column, index) => {
              if (!column) {
                return null;
              }

              if (row[index] && typeof row[index] === 'object') {
                return row[index].sortBy || row[index].value;
              }

              if (!row[index]) {
                return '';
              }

              return row[index];
            })
            .filter(item => item !== null)
            .join(',');
          return filteredRow;
        });
        return rowsByTable.join('\n');
      })
      .join('\n');
    return csv;
  };

  static fetchParameters() {
    return {
      queryString: '/npexplorer/simpleconnections'
    };
  }

  static getColumnHeaders() {
    const columnIds = [
      { name: 'expansion', status: true, hidden: true },
      { name: 'id', status: true },
      { name: 'type', status: true },
      { name: 'instance', status: false },
      { name: 'status', status: true },
      { name: '#connections', status: true },
      { name: '#connections (high confidence)', status: false },
      { name: 'expected connection range', status: false },
      { name: 'inputs (#post)', status: true },
      { name: 'outputs (#pre)', status: true },
      { name: '#voxels', status: false },
      { name: 'brain region heatmap', status: false },
      { name: 'brain region breakdown', status: true }
    ];
    return columnIds;
  }

  static processDownload(response) {
    const headers = [
      'id',
      'type',
      'instance',
      'status',
      '#connections',
      'inputs (#post)',
      'outputs (#pre)',
      '#voxels'
    ];

    const roiList = response.result.data[0][12];
    roiList.sort().forEach(roi => {
      headers.push(`${roi} post`);
      headers.push(`${roi} pre`);
    });

    const data = response.result.data.map(row => {
      const [
        ,
        ,
        // queryBodyName
        // queryBodyType
        targetBodyName,
        targetBodyType,
        targetBodyId,
        connections, // queryBodyId
        ,
        traceStatus,
        roiCounts,
        voxels,
        outputs,
        inputs,
        rois, // highConfConnections
        ,
      ] = row;
      const roiInfoObject = JSON.parse(roiCounts);

      const converted = [
        targetBodyId,
        targetBodyType,
        targetBodyName,
        traceStatus,
        connections,
        inputs,
        outputs,
        voxels
      ];
      // figure out roi counts.
      if (rois.length > 0) {
        rois.sort().forEach(roi => {
          if (roiInfoObject[roi]) {
            converted.push(roiInfoObject[roi].post);
            converted.push(roiInfoObject[roi].pre);
          }
        });
      }

      return converted;
    });
    data.unshift(headers);
    return data;
  }

  static processResults({ query, apiResponse, actions, submitFunc, isPublic }) {
    // settings for whether or not the application is in public mode
    let includeWeightHP;
    if (isPublic) {
      includeWeightHP = false;
    } else {
      includeWeightHP = true;
    }
    const tables = [];
    const inputs = query.pm.find_inputs;

    const { visProps = {} } = query;

    const combinedByType = visProps.collapsed;

    let currentTable = [];
    let lastBody = -1;
    let lastName = '';

    const { columns, data } = createSimpleConnectionsResult(
      query.ds,
      apiResponse,
      actions,
      submitFunc,
      inputs,
      includeWeightHP,
      combinedByType
    );

    data.forEach(row => {
      const [neuron1Name, neuron1Id] = row;
      if (lastBody !== -1 && neuron1Id !== lastBody) {
        let tableName = `${lastName || lastBody} id=(${String(lastBody)})`;
        if (inputs === false) {
          tableName = `${tableName} => ...`;
        } else {
          tableName = `... => ${tableName}`;
        }

        tables.push({
          columns,
          data: currentTable,
          name: tableName
        });
        currentTable = [];
      }
      // change code here to use common code
      lastBody = neuron1Id;
      lastName = neuron1Name;

      currentTable.push(row.slice(2));
      //
    });

    if (lastBody !== -1) {
      let tableName = `${lastName || lastBody} id=(${String(lastBody)})`;
      if (inputs === true) {
        tableName = `${tableName} <= ...`;
      } else {
        tableName = `${tableName} => ...`;
      }

      tables.push({
        columns,
        data: currentTable,
        name: tableName
      });
    }

    // Title choices.
    const neuronSrc = query.pm.neuron_name || query.pm.neuron_id;
    const preOrPost = inputs ? 'pre' : 'post';

    return {
      data: tables,
      debug: apiResponse.debug,
      title: `Neurons ${preOrPost}synaptic to ${neuronSrc}`
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      neuronName: '',
      preOrPost: 'post',
      advancedSearch: JSON.parse(localStorage.getItem('neuprint_advanced_search')) || false
    };
  }

  processRequest = () => {
    const { dataSet, actions, submit } = this.props;
    const { neuronName, preOrPost, advancedSearch } = this.state;
    if (neuronName !== '') {
      const parameters = {
        dataset: dataSet
      };
      if (!advancedSearch) {
        parameters.enable_contains = true;
      }
      if (/^\d+$/.test(neuronName)) {
        parameters.neuron_id = neuronName;
      } else {
        parameters.neuron_name = neuronName;
      }
      if (preOrPost === 'post') {
        parameters.find_inputs = false;
      } else {
        parameters.find_inputs = true;
      }
      const query = {
        dataSet,
        plugin: pluginName,
        pluginCode: pluginAbbrev,
        visProps: { paginateExpansion: true },
        parameters
      };

      submit(query);
      return query;
    }
    actions.formError('Please enter a neuron name.');
    return {};
  };

  handleNeuronName = neuronName => {
    this.setState({ neuronName });
  };

  handleDirection = event => {
    this.setState({ preOrPost: event.target.value });
  };

  toggleAdvanced = event => {
    localStorage.setItem('neuprint_advanced_search', event.target.checked);
    this.setState({ advancedSearch: event.target.checked, neuronName: '' });
  };

  render() {
    const { classes, isQuerying, dataSet } = this.props;
    const { preOrPost, neuronName, advancedSearch } = this.state;
    return (
      <div>
        {advancedSearch ? (
          <AdvancedNeuronInput
            onChange={this.handleNeuronName}
            value={neuronName}
            dataSet={dataSet}
            handleSubmit={this.processRequest}
          />
        ) : (
          <NeuronInputField
            onChange={this.handleNeuronName}
            value={neuronName}
            handleSubmit={this.processRequest}
            dataSet={dataSet}
          />
        )}
        <FormControl variant="standard" className={classes.formControl}>
          <FormControlLabel
            control={
              <Switch checked={advancedSearch} onChange={this.toggleAdvanced} color="primary" />
            }
            label={
              <Typography variant="subtitle1" style={{ display: 'inline-flex' }}>
                Advanced input
              </Typography>
            }
          />
        </FormControl>
        <FormControl variant="standard" className={classes.formControl}>
          <FormLabel component="legend">Neuron Direction</FormLabel>
          <RadioGroup
            aria-label="preOrPost"
            name="preOrPost"
            className={classes.group}
            value={preOrPost}
            onChange={this.handleDirection}
          >
            <FormControlLabel
              value="post"
              control={<Radio color="primary" />}
              label="Find postsynaptic partners (outputs)"
            />
            <FormControlLabel
              value="pre"
              control={<Radio color="primary" />}
              label="Find presynaptic partners (inputs)"
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
  submit: PropTypes.func.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  dataSet: PropTypes.string.isRequired
};

export default withStyles(styles)(SimpleConnections);
