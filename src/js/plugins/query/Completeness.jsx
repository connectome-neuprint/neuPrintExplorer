/*
 * Queries completeness of reconstruction with respect to neuron filters.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import NeuronFilterNew, {
  convertToCypher,
  thresholdCypher,
  statusCypher
} from './shared/NeuronFilterNew';

const pluginName = 'Completeness';
const pluginAbbrev = 'co';

const columnHeaders = ['Brain Region', '%presyn', 'total presyn', '%postsyn', 'total postsyn'];

class Completeness extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: pluginName,
      abbr: pluginAbbrev,
      category: 'recon',
      description:
        'Determines the percentage of pre-synaptice and post-synpatic sites for each brain region that are in the filter list.  The percentage of Traced neurons will provide a metric for the completeness of a brain region',
      visType: 'SimpleTable'
    };
  }

  static getColumnHeaders() {
    return columnHeaders.map(column => ({ name: column, status: true }));
  }


  static fetchParameters(params) {
    const filters = params.filters ? Object.entries(params.filters).map(([filterName, value]) => 
      convertToCypher(filterName, Array.isArray(value) ? value : [value])
    ) : [];

    const conditions = [
      thresholdCypher('pre', params.pre),
      thresholdCypher('post', params.post),
      statusCypher(params.statuses),
      ...filters
    ].filter(condition => condition !== '').join(' AND ');

    const hasConditions = conditions.length > 0 ? 'WHERE' : '';

    const cypherQuery = `MATCH (neuron:Neuron) ${hasConditions} ${conditions}
WITH apoc.convert.fromJsonMap(neuron.roiInfo) AS roiInfo
WITH roiInfo AS roiInfo, keys(roiInfo) AS roiList
UNWIND roiList AS roiName
WITH roiName AS roiName, sum(roiInfo[roiName].pre) AS pre, sum(roiInfo[roiName].post) AS post
MATCH (meta:Meta)
WITH apoc.convert.fromJsonMap(meta.roiInfo) AS globInfo, roiName AS roiName, pre AS pre, post AS post
WHERE not coalesce(globInfo[roiName]['isNerve'], FALSE)
RETURN roiName AS unlabelres, pre AS roipre, post AS roipost, globInfo[roiName].pre AS totalpre, globInfo[roiName].post AS totalpost
ORDER BY roiName`;
    return {
      cypherQuery,
      queryString: '/custom/custom?np_explorer=completeness'
    };
  }

  static processResults({ query, apiResponse }) {
    const { pm: parameters } = query;
    const data = apiResponse.data.map(row => [
      row[0], // roiname
      ((row[1] / row[3]) * 100).toPrecision(4), // % pre
      row[3], // total pre
      ((row[2] / row[4]) * 100).toPrecision(4), // % post
      row[4] // total post
    ]);

    return {
      columns: columnHeaders,
      data,
      debug: apiResponse.debug,
      title: `Coverage percentage of filtered neurons in ${parameters.dataset}`
    };
  }

  static processDownload(response) {
    const headers = ['Brain Region', '%presyn', 'total presyn', '%postsyn', 'total postsyn'];
    const data = response.result.data
      .map(
        row =>
          [row[0], ((row[1] / row[3]) * 100), row[3], ((row[2] / row[4]) * 100), row[4]]
      )
    data.unshift(headers);
    return data;
  }

  constructor(props) {
    super(props);

    this.state = {
      limitNeurons: true,
      status: [],
      filters: {},
      pre: 0,
      post: 0
    };
  }

  loadNeuronFiltersNew = filters => {
    this.setState({
      filters
    });
  };

  processRequest = () => {
    const { dataSet, submit } = this.props;
    const { limitNeurons, status, pre, post, filters } = this.state;

    const parameters = {
      dataset: dataSet,
      statuses: status,
      all_segments: !limitNeurons
    };

    if (Object.keys(filters).length > 0) {
      parameters.filters = filters;
    }

    if (pre > 0) {
      parameters.pre = pre;
    }

    if (post > 0) {
      parameters.post = post;
    }

    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters
    };
    submit(query);
  };

  render() {
    const { isQuerying, dataSet, actions, neoServerSettings } = this.props;
    return (
      <div>
        <NeuronFilterNew
          callback={this.loadNeuronFiltersNew}
          datasetstr={dataSet}
          actions={actions}
          neoServer={neoServerSettings.get('neoServer')}
        />
        <Button
          disabled={isQuerying}
          color="primary"
          variant="contained"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

Completeness.propTypes = {
  isQuerying: PropTypes.bool.isRequired,
  neoServerSettings: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  submit: PropTypes.func.isRequired
};

export default Completeness;
