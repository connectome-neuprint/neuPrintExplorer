/*
 * Supports simple, custom neo4j query.
 */
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import { RoiInfoTip } from 'plugins/support';

import NeuronInputField from './shared/NeuronInputField';

function byPostValues(a, b) {
  return b[1].post - a[1].post;
}

const pluginName = 'ROIsIntersectingNeurons';
const pluginAbbrev = 'rin';

class ROIsIntersectingNeurons extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Brain Regions in Neuron',
      abbr: pluginAbbrev,
      description:
        'Find brain regions that intersect a given neuron(s).  A putative name is given based on top two brain region inputs and outputs',
      visType: 'CollapsibleTable'
    };
  }

  static fetchParameters() {
    return {
      queryString: '/npexplorer/roisinneuron'
    };
  }

  static processResults({ apiResponse, roiLookup }) {
    const columnNames = ['brain region name', 'inputs', 'outputs'];
    const tables = [];

    apiResponse.data.forEach(row => {
      const [bodyId, bodyName, bodyType, roiInfo] = row;
      const decodedROIs = JSON.parse(roiInfo);

      const largestPre = [['', -Infinity], ['', -Infinity]];
      const largestPost = [['', -Infinity], ['', -Infinity]];

      // sort the rois from most inputs/outputs to least.
      const data = Object.entries(decodedROIs)
        .sort(byPostValues)
        .map(entry => {
          const [roi, value] = entry;
          const { pre, post } = value;

          /* eslint-disable prefer-destructuring */
          if (pre > 0) {
            if (pre > largestPre[0][1]) {
              largestPre[1] = largestPre[0];
              largestPre[0] = [roi, pre];
            } else if (pre < largestPre[0][1] && pre > largestPre[1][1]) {
              largestPre[1] = [roi, pre];
            }
          }

          if (post > 0) {
            if (post > largestPost[0][1]) {
              largestPost[1] = largestPost[0];
              largestPost[0] = [roi, post];
            } else if (post < largestPost[0][1] && post > largestPost[1][1]) {
              largestPost[1] = [roi, post];
            }
          }

          /* eslint-enable prefer-destructuring */

          return [<RoiInfoTip roi={roi} roiLookup={roiLookup} />, post, pre];
        });

      const preTitle = largestPre.map(item => item[0]).join('');
      const postTitle = largestPost.map(item => item[0]).join('');

      tables.push({
        columns: columnNames,
        data,
        name: `${postTitle}=>${preTitle} | ${bodyName}=(${bodyType},${bodyId})`
      });
    });

    return {
      data: tables,
      debug: apiResponse.debug,
      title: 'Brain regions intersecting neurons'
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      neuronsrc: ''
    };
  }

  processRequest = () => {
    const { dataSet, actions, submit } = this.props;
    const { neuronsrc } = this.state;
    if (neuronsrc !== '') {
      const parameters = { dataset: dataSet };
      if (/^\d+$/.test(neuronsrc)) {
        parameters.neuron_id = parseInt(neuronsrc, 10);
      } else {
        parameters.neuron_name = neuronsrc;
      }
      const query = {
        dataSet,
        parameters,
        plugin: pluginName,
        pluginCode: pluginAbbrev
      };
      submit(query);
    } else {
      actions.formError('Please enter a neuron name.');
    }
  };

  handleClick = neuronsrc => {
    this.setState({ neuronsrc });
  };

  render() {
    const { isQuerying, dataSet } = this.props;
    const { neuronsrc } = this.state;
    return (
      <div>
        <NeuronInputField
          dataSet={dataSet}
          onChange={this.handleClick}
          value={neuronsrc}
          handleSubmit={this.processRequest}
        />
        <Button
          color="primary"
          disabled={isQuerying}
          variant="contained"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

ROIsIntersectingNeurons.propTypes = {
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
  submit: PropTypes.func.isRequired
};

export default ROIsIntersectingNeurons;
