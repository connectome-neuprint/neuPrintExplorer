import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
// eslint-disable-next-line import/no-unresolved
import { round } from 'mathjs';
import Select from 'react-select';
import { setColumnIndices } from './shared/pluginhelpers';

const styles = theme => ({
  textField: {
    width: 300,
    margin: '0 0 1em 0'
  },
  button: {
    margin: 4,
    display: 'block'
  },
  formControl: { display: 'block' },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

const pluginName = 'SynapsesForConnection';
const pluginAbbrev = 'sfc';

export class SynapsesForConnection extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Synapses for connection',
      abbr: pluginAbbrev,
      description: 'Retrieves synapses involved in a connection.',
      visType: 'SimpleTable'
    };
  }

  static getColumnHeaders() {
    const columnIds = ['type', 'location', 'confidence', 'brain region'];
    return columnIds.map(column => ({name: column, status: true}));
  }

  static fetchParameters(params) {
    const {bodyId1 = '', bodyId2 = '', rois = [] } = params;

    let roiPredicate = '';
    if (rois.length > 0) {
      roiPredicate = ' WHERE (';
      rois.forEach(roi => {
        roiPredicate += `exists(s.\`${roi}\`) AND `;
      });
      roiPredicate = roiPredicate.slice(0, -5);
      roiPredicate += ')';
    }

    const cypherQuery = `MATCH (a:Neuron{bodyId:${bodyId1}})-[:Contains]->(ss :SynapseSet)-[:ConnectsTo]->(:SynapseSet)<-[:Contains]-(b{bodyId:${bodyId2}})
WITH ss MATCH (ss)-[:Contains]->(s:Synapse)${roiPredicate}
RETURN s.type, s.location.x ,s.location.y ,s.location.z, s.confidence, keys(s)
UNION
MATCH (a:Neuron{bodyId:${bodyId1}})-[:Contains]->(:SynapseSet)-[:ConnectsTo]->(ss :SynapseSet)<-[:Contains]-(b{bodyId:${bodyId2}})
WITH ss MATCH (ss)-[:Contains]->(s:Synapse)${roiPredicate}
RETURN s.type, s.location.x ,s.location.y ,s.location.z, s.confidence, keys(s)`;

    return {
      cypherQuery
    };
  }

  static processResults({ query, apiResponse, actions }) {
    const { pm: parameters = {} } = query;
    const { bodyId1 = '', bodyId2 = '', rois = [] } = parameters;
    const indexOf = setColumnIndices(['type', 'location', 'confidence', 'rois']);

    const title = `Synapses involved in connection between ${bodyId1} and ${bodyId2}`;

    if (apiResponse.data && apiResponse.data.length > 0) {
      const data = apiResponse.data.map(row => {
        const type = row[0];
        const x = row[1];
        const y = row[2];
        const z = row[3];
        const confidence = row[4];
        const properties = row[5];

        const converted = [];
        converted[indexOf.type] = type;
        converted[indexOf.location] = `[${x},${y},${z}]`;
        converted[indexOf.confidence] = round(confidence, 4);
        converted[indexOf.rois] = properties.filter(
          value =>
            value !== 'type' &&
            value !== 'location' &&
            value !== 'confidence' &&
            value !== 'timeStamp'
        );

        return converted;
      });

      const columns = [];
      columns[indexOf.type] = 'type';
      columns[indexOf.location] = 'location';
      columns[indexOf.confidence] = 'confidence';
      columns[indexOf.rois] = 'brain region';

      return {
        columns,
        data,
        debug: apiResponse.debug,
        title
      };
    }

    actions.pluginResponseError(
      `No synapses between ${bodyId1} and ${bodyId2} in specified brain regions (${rois})`
    );
    return {
      columns: [],
      data: [],
      debug: apiResponse.debug,
      title
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      bodyId1: '',
      bodyId2: '',
      rois: []
    };
  }

  processRequest = () => {
    const { dataSet, submit } = this.props;
    const { bodyId1, bodyId2, rois } = this.state;

      const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: {
        dataset: dataSet,
        bodyId1,
        bodyId2,
        rois,
      }
    };
    submit(query);
  };


  addBodyId1 = event => {
    this.setState({ bodyId1: event.target.value });
  };

  addBodyId2 = event => {
    this.setState({ bodyId2: event.target.value });
  };

  handleChangeRois = selected => {
    const rois = selected.map(item => item.value);
    this.setState({ rois });
  };

  render() {
    const { classes, isQuerying, availableROIs } = this.props;
    const { bodyId1, bodyId2, rois } = this.state;

    const roiOptions = availableROIs.map(name => ({
      label: name,
      value: name
    }));

    const roiValues = rois.map(roi => ({
      label: roi,
      value: roi
    }));

    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            label="Neuron ID A"
            fullWidth
            rows={1}
            value={bodyId1}
            rowsMax={1}
            className={classes.textField}
            onChange={this.addBodyId1}
          />
          <TextField
            label="Neuron ID B"
            fullWidth
            rows={1}
            value={bodyId2}
            rowsMax={1}
            className={classes.textField}
            onChange={this.addBodyId2}
          />
        </FormControl>
        <InputLabel htmlFor="select-multiple-chip">Brain Regions</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={roiValues}
          onChange={this.handleChangeRois}
          options={roiOptions}
          closeMenuOnSelect={false}
        />
        <Button
          variant="contained"
          className={classes.button}
          onClick={this.processRequest}
          color="primary"
          disabled={isQuerying}
        >
          Submit
        </Button>
      </div>
    );
  }
}

SynapsesForConnection.propTypes = {
  classes: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  availableROIs: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default withStyles(styles)(SynapsesForConnection);
