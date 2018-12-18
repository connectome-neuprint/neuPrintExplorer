/*
 * Supports simple, custom neo4j query.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import randomColor from 'randomcolor';
import { withRouter } from 'react-router';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import { withStyles } from '@material-ui/core/styles';

import { LoadQueryString, SaveQueryString } from 'helpers/qsparser';
import { setUrlQS } from 'actions/app';
import { getQueryString } from 'helpers/queryString';
import { submit, formError } from 'actions/plugins';
import NeuronHelp from '../NeuronHelp';

const styles = () => ({
  textField: {},
  formControl: {
    margin: '0.5em 0 1em 0',
    width: '100%'
  }
});

function byPostValues(a, b) {
  return b[1].post - a[1].post;
}

const pluginName = 'ROIsIntersectingNeurons';

class ROIsIntersectingNeurons extends React.Component {
  constructor(props) {
    super(props);
    const initqsParams = {
      neuronsrc: ''
    };
    const qsParams = LoadQueryString(
      `Query:${this.constructor.queryName}`,
      initqsParams,
      props.urlQueryString
    );
    this.state = {
      qsParams
    };
  }

  static get queryName() {
    return 'ROIs in Neuron';
  }

  static get queryDescription() {
    return 'Find ROIs that intersect a given neuron(s).  A putative name is given based on top two ROI inputs and outputs';
  }

  static get isExperimental() {
    return true;
  }

  processResults = (query, apiResponse) => {
    const columnNames = ['ROI name', 'inputs', 'outputs'];
    const tables = [];

    apiResponse.data.forEach(row => {
      const [bodyId, bodyName, roiInfo] = row;
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

          return [roi, post, pre];
        });

      const preTitle = largestPre.map(item => item[0]).join('');
      const postTitle = largestPost.map(item => item[0]).join('');

      tables.push({
        columns: columnNames,
        data,
        name: `${postTitle}=>${preTitle} | ${bodyName}=(${bodyId})`
      });
    });

    return {
      data: tables,
      debug: apiResponse.debug
    };
  };

  processRequest = () => {
    const { dataSet, history, actions } = this.props;
    const { qsParams } = this.state;
    if (qsParams.neuronsrc !== '') {
      const parameters = { dataset: dataSet };
      if (/^\d+$/.test(qsParams.neuronsrc)) {
        parameters.neuron_id = parseInt(qsParams.neuronsrc, 10);
      } else {
        parameters.neuron_name = qsParams.neuronsrc;
      }
      const query = {
        dataSet,
        queryString: '/npexplorer/roisinneuron',
        parameters,
        visType: 'CollapsibleTable',
        plugin: pluginName,
        title: 'ROIs intersecting neurons',
        menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
        processResults: this.processResults
      };
      actions.submit(query);
      // redirect to the results page.
      history.push({
        pathname: '/results',
        search: getQueryString()
      });
    } else {
      actions.formError('Please enter a neuron name.');
    }
  };

  handleClick = event => {
    const { actions } = this.props;
    actions.setURLQs(
      SaveQueryString(`Query:${this.constructor.queryName}`, { neuronsrc: event.target.value })
    );
    this.setState({ qsParams: { neuronsrc: event.target.value } });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processRequest();
    }
  };

  render() {
    const { classes, isQuerying } = this.props;
    const { qsParams } = this.state;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name"
              multiline
              fullWidth
              rows={1}
              value={qsParams.neuronsrc}
              rowsMax={4}
              className={classes.textField}
              onChange={this.handleClick}
              onKeyDown={this.catchReturn}
            />
          </NeuronHelp>
        </FormControl>
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
  urlQueryString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired
};

const ROIsIntersectingNeuronsState = state => ({
  isQuerying: state.query.isQuerying,
  urlQueryString: state.app.get('urlQueryString')
});

const ROIsIntersectingNeuronsDispatch = dispatch => ({
  actions: {
    setURLQs(querystring) {
      dispatch(setUrlQS(querystring));
    },
    submit: query => {
      dispatch(submit(query));
    },
    formError: query => {
      dispatch(formError(query));
    }
  }
});

export default withRouter(
  withStyles(styles)(
    connect(
      ROIsIntersectingNeuronsState,
      ROIsIntersectingNeuronsDispatch
    )(ROIsIntersectingNeurons)
  )
);
