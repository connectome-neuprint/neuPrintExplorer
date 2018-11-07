/*
 * Plugin for body size distribution.
*/
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { withRouter } from 'react-router';

import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';

import { submit } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';

const styles = theme => ({
  selects: {
    width: '100%',
  }
});

const pluginName = 'Distribution';

class Distribution extends React.Component {
  state = {
    isPre: true,
    roi: ''
  };

  static get queryName() {
    return 'Distribution';
  }

  static get queryDescription() {
    return 'Shows segment size distribution for segments in a given region.';
  }

  processResults = (query, apiResponse) => {
    const data = [];

    const dist = [.2, .3, .4, .5, .6, .7, .8, .9, .95, 1.0];
    let currdist = 0;

    let distCount = [];
    let distTotal = [];
    let currSize = 0;
    let numSeg = 0;

    apiResponse.data.forEach(record => {
        let size = parseInt(record[1]);
        let total = parseInt(record[2]);
        currSize += size;
        numSeg++;

        while ((currdist < dist.length) && ((currSize)/total >= dist[currdist])) {
            distCount.push(numSeg);
            distTotal.push(currSize);

            data.push([
                JSON.stringify(dist[currdist]),
                JSON.stringify(distCount[currdist]),
                JSON.stringify(distTotal[currdist]),
            ]);
            currdist++;
        }
    });

    const typeHeader = query.parameters.is_pre
      ? 'Number of pre-synapses'
      : 'Number of post-synapses';

    return {
      columns: ['percentage', 'num segments', typeHeader],
      data,
      debug: apiResponse.debug
    };
  };

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { isPre, roi } = this.state;
    const query = {
      dataSet,
      queryString: '/npexplorer/distribution',
      visType: 'SimpleTable',
      plugin: pluginName,
      parameters: {
        dataset: dataSet,
        ROI: roi,
        is_pre: isPre
      },
      title: `Distribution of body sizes for ${roi}`,
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

  setROI = event => {
    let roiname = event.target.value;
    // let newparams = Object.assign({}, this.state.qsParams, { roi: roiname });
    // this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, newparams));
    this.setState({ roi: roiname });
  };

  setType = event => {
    let type = event.target.value;
    // let newparams = Object.assign({}, this.state.qsParams, { type: type });
    // this.props.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, newparams));
    this.setState({ isPre: type });
  };

  render() {
    const { isQuerying, classes, availableROIs } = this.props;
    const { roi } = this.state;
    return (
      <form>
        <Select value={roi} onChange={this.setROI} className={classes.selects}>
          {availableROIs.map(val => {
            return (
              <MenuItem key={val} value={val}>
                {val}
              </MenuItem>
            );
          })}
        </Select>
        <Select
          className={classes.selects}
          value={this.state.isPre}
          onChange={this.setType}
          inputProps={{
            name: 'Data type used for distribution',
            id: 'controlled-open-select'
          }}
        >
          <MenuItem key={'presyn'} value={true}>
            Pre-synaptic
          </MenuItem>
          <MenuItem key={'postsyn'} value={false}>
            Post-synaptic
          </MenuItem>
        </Select>

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
  callback: PropTypes.func.isRequired,
  datasetstr: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  availableROIs: PropTypes.array.isRequired,
};

var DistributionState = function(state) {
  return {
    isQuerying: state.query.isQuerying
  };
};

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
var DistributionDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    }
  }
});

export default withRouter(
  withStyles(styles)(
    connect(
      DistributionState,
      DistributionDispatch
    )(Distribution)
  )
);
