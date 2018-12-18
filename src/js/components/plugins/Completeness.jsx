/*
 * Queries completeness of reconstruction with respect to neuron filters.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { withRouter } from 'react-router';

import Button from '@material-ui/core/Button';

import { submit } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';
import NeuronFilter from '../NeuronFilter';

const pluginName = 'Completeness';

class Completeness extends React.Component {
  static get queryName() {
    return 'Completeness';
  }

  static get queryCategory() {
    return 'recon';
  }

  static get queryDescription() {
    return 'Determines the reconstruction completeness of each ROI with respect to the neuron filters';
  }

  static get isExperimental() {
    return true;
  }

  constructor(props) {
    super(props);

    this.state = {
      limitNeurons: true,
      statusFilters: [],
      preThreshold: 0,
      postThreshold: 0
    };
  }

  loadNeuronFilters = params => {
    this.setState({
      limitNeurons: params.limitNeurons,
      statusFilters: params.statusFilters,
      preThreshold: parseInt(params.preThreshold, 10),
      postThreshold: parseInt(params.postThreshold, 10)
    });
  };

  processResults = (query, apiResponse) => {
    const data = apiResponse.data.map(row => [
      row[0], // roiname
      (row[1] / row[3]) * 100, // % pre
      row[3], // total pre
      (row[2] / row[4]) * 100, // % post
      row[4] // total post
    ]);

    return {
      columns: ['ROI', '%presyn', 'total presyn', '%postsyn', 'total postsyn'],
      data,
      debug: apiResponse.debug
    };
  };

  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { limitNeurons, statusFilters, preThreshold, postThreshold } = this.state;

    const parameters = {
      dataset: dataSet,
      statuses: statusFilters,
      all_segments: !limitNeurons
    };

    if (preThreshold > 0) {
      parameters.pre_threshold = preThreshold;
    }

    if (postThreshold > 0) {
      parameters.post_threshold = postThreshold;
    }

    const query = {
      dataSet,
      queryString: '/npexplorer/completeness',
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters,
      title: `Coverage percentage of filtered neurons in ${dataSet}`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };
    actions.submit(query);
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
    return query;
  };

  render() {
    const { isQuerying, dataSet } = this.props;
    return (
      <div>
        <NeuronFilter callback={this.loadNeuronFilters} datasetstr={dataSet} />
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
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const CompletenessState = state => ({
  isQuerying: state.query.isQuerying
});

const CompletenessDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    }
  }
});

export default withRouter(
  connect(
    CompletenessState,
    CompletenessDispatch
  )(Completeness)
);
