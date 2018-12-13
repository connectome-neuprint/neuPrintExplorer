/*
 * Plugin for body size distribution.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import { withRouter } from 'react-router';
import Immutable from 'immutable';

import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { withStyles } from '@material-ui/core/styles';

import { submit } from 'actions/plugins';
import {getQueryString, getSiteParams, setQueryString } from 'helpers/queryString';

const styles = theme => ({
  selects: {
    width: '100%',
    margin: theme.spacing.unit
  }
});

const pluginName = 'Distribution';

class Distribution extends React.Component {
  static get queryName() {
    return 'Distribution';
  }

  static get queryCategory() {
    return 'recon';
  }

  static get queryDescription() {
    return 'Shows segment size distribution for segments in a given region.';
  }

  static get isExperimental() {
    return true;
  }

  processResults = (query, apiResponse) => {
    const data = [];

    const dist = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0];
    let currdist = 0;

    const distCount = [];
    const distTotal = [];
    let currSize = 0;
    let numSeg = 0;

    apiResponse.data.forEach(record => {
      const size = parseInt(record[1], 10);
      const total = parseInt(record[2], 10);
      currSize += size;
      numSeg += 1;

      while (currdist < dist.length && currSize / total >= dist[currdist]) {
        distCount.push(numSeg);
        distTotal.push(currSize);

        data.push([
          JSON.stringify(dist[currdist]),
          JSON.stringify(distCount[currdist]),
          JSON.stringify(distTotal[currdist])
        ]);
        currdist += 1;
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
    const { dataSet, actions, history, location } = this.props;
    const qsParams = getSiteParams(location);
    const { roi, isPre } = qsParams.getIn(['input','distribution'], Immutable.Map({})).toJS();
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
    const roiname = event.target.value;
    setQueryString({
      'input': {
        distribution: {
          roi: roiname
        }
      }
    });
  };

  setType = event => {
    const type = event.target.value;
     setQueryString({
      'input': {
        distribution: {
          isPre: type
        }
      }
    });
  };

  render() {
    const { isQuerying, classes, availableROIs, location } = this.props;
    const qsParams = getSiteParams(location);
    // oh boy, this is ugly. There needs to be a better way to set defaults.
    // I think we should be able to change getSiteParams to accept defaults
    // and merge the values from the url with the defaults.
    // eg:
    //    const qsParams = getSiteParams(location, defaults);
    //    const { roi, isPre } = qsParams.getIn(['input','distribution']).toJS();
    let { roi, isPre } = qsParams.getIn(['input','distribution'], Immutable.Map({})).toJS();

    if (roi === undefined) {
      roi = '';
    }

    if (isPre === undefined) {
      isPre = true;
    }

    return (
      <form>
        <FormControl className={classes.selects}>
          <InputLabel htmlFor="roi">ROI</InputLabel>
          <Select
            value={roi}
            onChange={this.setROI}
            inputProps={{
              name: 'roi',
              id: 'roi'
            }}
          >
            {availableROIs.map(val => (
              <MenuItem key={val} value={val}>
                {val}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className={classes.selects}>
          <InputLabel htmlFor="isPre">Pre or Post Synaptic</InputLabel>
          <Select
            value={isPre}
            onChange={this.setType}
            inputProps={{
              name: 'isPre',
              id: 'isPre'
            }}
          >
            <MenuItem key="presyn" value>
              Pre-synaptic
            </MenuItem>
            <MenuItem key="postsyn" value={false}>
              Post-synaptic
            </MenuItem>
          </Select>
        </FormControl>

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
  classes: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  availableROIs: PropTypes.arrayOf(PropTypes.string).isRequired,
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const DistributionState = state => ({
  isQuerying: state.query.isQuerying
});

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
const DistributionDispatch = dispatch => ({
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
