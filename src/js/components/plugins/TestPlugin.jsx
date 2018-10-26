import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

import { submit } from '../../actions/plugins';
import { setUrlQS } from '../../actions/app';
import { skeletonAddandOpen } from '../../actions/skeleton';
import RoiHeatMap, { ColorLegend } from '../../components/visualization/MiniRoiHeatMap.react';
import RoiBarGraph from '../../components/visualization/MiniRoiBarGraph.react';
import NeuronHelp from '../NeuronHelp.react';
import NeuronFilter from '../NeuronFilter.react';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';

const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  }
});

const pluginName = 'TestPlugin';

class TestPlugin extends React.Component {
  constructor(props) {
    super(props);
    var initqsParams = {
      InputROIs: [],
      OutputROIs: [],
      neuronsrc: ''
    };
    var qsParams = LoadQueryString(
      'Query:' + this.constructor.queryName,
      initqsParams,
      this.props.urlQueryString
    );
    this.state = {
      qsParams: qsParams,
      limitBig: true,
      statusFilters: []
    };
  }

  static get queryName() {
    // This is the string used in the 'Query Type' select.
    return 'Test Plugin';
  }

  static get queryDescription() {
    // This is a description of the purpose of the plugin.
    // it will be displayed in the form above the custom
    // inputs for this plugin.
    return 'Generates simple table on submit.';
  }
  // this function will parse the results from the query to the
  // Neo4j server and place them in the correct format for the
  // visualization plugin.
  processResults = (dataSet, apiResponse) => {
    const { actions } = this.props;
    const roiList = ['proximal', 'distal', 'none'];

    const data = apiResponse.data.map(row => {
      const roiInfoObject = JSON.parse(row[3]);

      const post = Object.values(roiInfoObject).reduce((total, current) => {
        return total + current.post;
      }, 0);

      const pre = Object.values(roiInfoObject).reduce((total, current) => {
        return total + current.pre;
      }, 0);

      // add this after the other rois have been summed.
      roiInfoObject['none'] = {
        pre: row[5] - pre,
        post: row[6] - post
      };

      const heatMap = (
        <RoiHeatMap
          roiList={roiList}
          roiInfoObject={roiInfoObject}
          preTotal={pre}
          postTotal={post}
        />
      );

      const barGraph = (
        <RoiBarGraph
          roiList={roiList}
          roiInfoObject={roiInfoObject}
          preTotal={pre}
          postTotal={post}
        />
      );

      return [
        {
          value: row[0],
          action: () => actions.skeletonAddandOpen(row[0], dataSet)
        },
        row[1],
        row[2],
        post,
        pre,
        row[4],
        heatMap,
        barGraph
      ];
    });
    return {
      columns: [
        'id',
        'neuron',
        'status',
        '#post (inputs)',
        '#pre (outputs)',
        '#voxels',
        <div>
          roi heatmap <ColorLegend />
        </div>,
        'roi breakdown'
      ],
      data,
      debug: apiResponse.debug
    };
  };

  // use this method to cleanup your form data, perform validation
  // and generate the query object.
  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { qsParams, statusFilters, limitBig } = this.state;

    const parameters = {
      dataset: dataSet,
      input_ROIs: qsParams.InputROIs,
      output_ROIs: qsParams.OutputROIs,
      statuses: statusFilters
    };

    if (qsParams.neuronsrc !== '') {
      if (isNaN(qsParams.neuronsrc)) {
        parameters['neuron_name'] = qsParams.neuronsrc;
      } else {
        parameters['neuron_id'] = parseInt(qsParams.neuronsrc);
      }
    }

    if (limitBig === 'true') {
      parameters['pre_threshold'] = 2;
    }

    const query = {
      dataSet, // <string> for the data set selected
      queryString: '/npexplorer/findneurons', // <neo4jquery string>
      // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
      visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
      plugin: pluginName, // <string> the name of this plugin.
      parameters, // <object>
      title: `Neurons with inputs in [${qsParams.InputROIs}] and outputs in [${
        qsParams.OutputROIs
      }]`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };
    actions.submit(query);
    // redirect to the results page.
    history.push('/results');
  };

  handleChangeROIsIn = selected => {
    var rois = selected.map(item => item.value);
    if (selected === undefined) {
      rois = [];
    }
    var oldparams = this.state.qsParams;
    oldparams.InputROIs = rois;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));

    this.setState({ qsParams: oldparams });
  };

  handleChangeROIsOut = selected => {
    var rois = selected.map(item => item.value);
    if (selected === undefined) {
      rois = [];
    }
    var oldparams = this.state.qsParams;
    oldparams.OutputROIs = rois;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));

    this.setState({ qsParams: oldparams });
  };

  addNeuron = event => {
    var oldparams = this.state.qsParams;
    oldparams.neuronsrc = event.target.value;
    this.props.actions.setURLQs(SaveQueryString('Query:' + this.constructor.queryName, oldparams));
    this.setState({ qsParams: oldparams });
  };

  loadNeuronFilters = params => {
    this.setState({ limitBig: params.limitBig, statusFilters: params.statusFilters });
  };

  // use this function to generate the form that will accept and
  // validate the variables for your Neo4j query.
  render() {
    const { classes, isQuerying, availableROIs } = this.props;
    const { qsParams } = this.state;

    const inputOptions = availableROIs.map(name => {
      return {
        label: name,
        value: name
      };
    });

    const inputValue = qsParams.InputROIs.map(roi => {
      return {
        label: roi,
        value: roi
      };
    });

    const outputOptions = availableROIs.map(name => {
      return {
        label: name,
        value: name
      };
    });

    const outputValue = qsParams.OutputROIs.map(roi => {
      return {
        label: roi,
        value: roi
      };
    });

    return (
      <div>
        <InputLabel htmlFor="select-multiple-chip">Input ROIs</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={inputValue}
          onChange={this.handleChangeROIsIn}
          options={inputOptions}
          closeMenuOnSelect={false}
        />
        <InputLabel htmlFor="select-multiple-chip">Output ROIs</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={outputValue}
          onChange={this.handleChangeROIsOut}
          options={outputOptions}
          closeMenuOnSelect={false}
        />
        <FormControl className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name (optional)"
              multiline
              rows={1}
              value={this.state.qsParams.neuronsrc}
              rowsMax={4}
              className={classes.textField}
              onChange={this.addNeuron}
            />
          </NeuronHelp>
          <NeuronFilter callback={this.loadNeuronFilters} datasetstr={this.props.datasetstr} />
        </FormControl>
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

// data that will be provided to your form. Use it to build
// inputs, selections and for validation.
TestPlugin.propTypes = {
  actions: PropTypes.object.isRequired,
  availableROIs: PropTypes.array.isRequired,
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired
};

var TestPluginState = function(state) {
  return {
    isQuerying: state.query.isQuerying
  };
};

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
var TestPluginDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    skeletonAddandOpen: (id, dataSet) => {
      dispatch(skeletonAddandOpen(id, dataSet));
    },
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  }
});

// boiler plate for redux.
export default withRouter(
  withStyles(styles)(
    connect(
      TestPluginState,
      TestPluginDispatch
    )(TestPlugin)
  )
);
