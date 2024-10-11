/*
 * Plugin for body size distribution.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

import BrainRegionInput from './shared/BrainRegionInput';

const pluginName = 'Distribution';
const pluginAbbrev = 'dn';

function processData(input) {
  const output = [];

  const dist = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0];
  let currdist = 0;

  const distCount = [];
  const distTotal = [];
  let currSize = 0;
  let numSeg = 0;

  input.forEach(record => {
    const size = parseInt(record[1], 10);
    const total = parseInt(record[2], 10);
    currSize += size;
    numSeg += 1;

    while (currdist < dist.length && currSize / total >= dist[currdist]) {
      distCount.push(numSeg);
      distTotal.push(currSize);

      output.push([
        JSON.stringify(dist[currdist]),
        JSON.stringify(distCount[currdist]),
        JSON.stringify(distTotal[currdist])
      ]);
      currdist += 1;
    }
  });

  return output;
}

class Distribution extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: pluginName,
      abbr: pluginAbbrev,
      category: 'recon',
      description: 'Shows segment size distribution for segments in a given region.',
      visType: 'SimpleTable'
    };
  }

  static fetchParameters() {
    return {
      queryString: '/npexplorer/distribution'
    };
  }

  static getColumnHeaders(query) {
    const { pm: parameters } = query;

    const typeHeader = parameters.is_pre ? 'Number of pre-synapses' : 'Number of post-synapses';

    const columnIds = ['percentage', 'num segments', typeHeader];

    return columnIds.map(column => ({ name: column, status: true }));
  }

  static processResults({ query, apiResponse }) {
    const data = processData(apiResponse.data);
    const { pm: parameters } = query;

    const typeHeader = parameters.is_pre ? 'Number of pre-synapses' : 'Number of post-synapses';

    return {
      columns: ['percentage', 'num segments', typeHeader],
      data,
      debug: apiResponse.debug,
      title: `Distribution of body sizes for ${parameters.ROI}`
    };
  }

  static processDownload(response) {
    const typeHeader = response.params.pm.is_pre
      ? 'Number of pre-synapses'
      : 'Number of post-synapses';
    const headers = ['percentage', 'num segments', typeHeader];
    const data = processData(response.result.data)
    data.unshift(headers);
    return data;
  }

  constructor(props) {
    super(props);
    this.state = {
      roi: null,
      isPre: true
    };
  }

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, submit } = this.props;
    const { roi, isPre } = this.state;
    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: {
        dataset: dataSet,
        ROI: roi.value,
        is_pre: isPre
      }
    };
    submit(query);
  };

  setROI = event => {
    this.setState({ roi: event });
  };

  setType = event => {
    this.setState({ isPre: event.target.value === 'true' });
  };

  render() {
    const { isQuerying, availableROIs } = this.props;
    const { roi, isPre } = this.state;

    const preValue = true;
    const postValue = false;

    return (
      <form>
        <InputLabel htmlFor="roi">Brain Region</InputLabel>
        <BrainRegionInput rois={availableROIs} value={roi} roiInfo={{}} onChange={this.setROI} isMulti={false} />
        <RadioGroup
          aria-label="Type Of Connections"
          name="type"
          value={isPre}
          onChange={this.setType}
        >
          <FormControlLabel
            value={preValue}
            control={<Radio color="primary" />}
            label="Pre-synaptic"
          />
          <FormControlLabel
            value={postValue}
            control={<Radio color="primary" />}
            label="Post-synaptic"
          />
        </RadioGroup>

        <Button
          disabled={isQuerying}
          color="primary"
          variant="contained"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </form>
    );
  }
}

Distribution.propTypes = {
  isQuerying: PropTypes.bool.isRequired,
  availableROIs: PropTypes.arrayOf(PropTypes.string).isRequired,
  dataSet: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired
};

export default Distribution;
