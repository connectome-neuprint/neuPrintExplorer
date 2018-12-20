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
import Icon from '@material-ui/core/Icon';

import { submit } from 'actions/plugins';
import { setUrlQS } from 'actions/app';
import { skeletonAddandOpen } from 'actions/skeleton';
import { neuroglancerAddandOpen } from 'actions/neuroglancer';
import { getQueryString } from 'helpers/queryString';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import RoiHeatMap, { ColorLegend } from '../visualization/MiniRoiHeatMap';
import RoiBarGraph from '../visualization/MiniRoiBarGraph';
import NeuronHelp from '../NeuronHelp';
import NeuronFilter from '../NeuronFilter';

const styles = theme => ({
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  clickable: {
    cursor: 'pointer'
  }
});

// this should match the name of the file this plugin is stored in.
const pluginName = 'FindNeurons';

class FindNeurons extends React.Component {
  constructor(props) {
    super(props);
    const { urlQueryString, dataSet } = this.props;
    const initqsParams = {
      inputROIs: [],
      outputROIs: [],
      neuronName: ''
    };
    const qsParams = LoadQueryString(
      `Query:${this.constructor.queryName}`,
      initqsParams,
      urlQueryString
    );

    // set the default state for the query input.
    this.state = {
      limitNeurons: true,
      statusFilters: [],
      preThreshold: 0,
      postThreshold: 0,
      qsParams,
      dataSet, // eslint-disable-line react/no-unused-state
      queryName: this.constructor.queryName // eslint-disable-line react/no-unused-state
    };
  }

  static get queryName() {
    // This is the string used in the 'Query Type' select.
    return 'Find neurons';
  }

  static get queryDescription() {
    // This is a description of the purpose of the plugin.
    // it will be displayed in the form above the custom
    // inputs for this plugin.
    return 'Find neurons that have inputs or outputs in ROIs';
  }

  static getDerivedStateFromProps = (props, state) => {
    // if dataset changes, clear the selected rois and statuses

    // eslint issues: https://github.com/yannickcr/eslint-plugin-react/issues/1751
    if (props.dataSet !== state.dataSet) {
      const oldParams = state.qsParams;
      oldParams.inputROIs = [];
      oldParams.outputROIs = [];
      state.statusFilters = []; // eslint-disable-line no-param-reassign
      props.actions.setURLQs(SaveQueryString(`Query:${state.queryName}`, oldParams));
      state.dataSet = props.dataSet; // eslint-disable-line no-param-reassign
      return state;
    }
    return null;
  };

  handleShowSkeleton = (id, dataSet) => () => {
    const { actions } = this.props;
    actions.skeletonAddandOpen(id, dataSet);
    actions.neuroglancerAddandOpen(id, dataSet);
  };

  processSimpleConnections = (query, apiResponse) => {
    const { dataSet, actions } = this.props;

    const findNeuronQuery = bodyId => {
      const parameters = {
        dataset: dataSet,
        neuron_id: bodyId
      };
      return {
        dataSet, // <string> for the data set selected
        queryString: '/npexplorer/findneurons', // <neo4jquery string>
        // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
        visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
        plugin: pluginName, // <string> the name of this plugin.
        parameters, // <object>
        title: `Neuron with id ${bodyId}`,
        menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
        processResults: this.processResults
      };
    };

    const data = apiResponse.data.map(row => [
      {
        value: row[2],
        action: () => actions.submit(findNeuronQuery(row[2]))
      },
      row[1],
      row[3]
    ]);

    return {
      columns: ['Neuron ID', 'Neuron', '#connections'],
      data,
      debug: apiResponse.debug
    };
  };

  // this function will parse the results from the query to the
  // Neo4j server and place them in the correct format for the
  // visualization plugin.
  processResults = (query, apiResponse) => {
    const { actions, classes } = this.props;

    const data = apiResponse.data.map(row => {
      const hasSkeleton = row[8];
      const converted = [
        {
          value: hasSkeleton ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              {row[0]}
              <div style={{ margin: '3px' }} />
              <Icon
                className={classes.clickable}
                onClick={this.handleShowSkeleton(row[0], query.dataSet)}
                fontSize="inherit"
              >
                visibility
              </Icon>
            </div>
          ) : (
            row[0]
          ),
          sortBy: row[0]
        },
        row[1],
        row[2],
        '-', // empty unless roiInfoObject present
        '-',
        row[4],
        '',
        ''
      ];

      // make sure none is added to the rois list.
      row[7].push('none');
      const roiList = row[7];
      const totalPre = row[5];
      const totalPost = row[6];

      const roiInfoObject = JSON.parse(row[3]);

      if (roiInfoObject) {
        // calculate # pre and post in super rois (which are disjoint) to get total
        // number of synapses assigned to an roi
        let postInSuperRois = 0;
        let preInSuperRois = 0;
        Object.keys(roiInfoObject).forEach(roi => {
          if (roiList.includes(roi)) {
            preInSuperRois += roiInfoObject[roi].pre;
            postInSuperRois += roiInfoObject[roi].post;
          }
        });

        // add this after the other rois have been summed.
        // records # pre and post that are not in rois
        roiInfoObject.none = {
          pre: row[5] - preInSuperRois,
          post: row[6] - postInSuperRois
        };

        const heatMap = (
          <RoiHeatMap
            roiList={roiList}
            roiInfoObject={roiInfoObject}
            preTotal={totalPre}
            postTotal={totalPost}
          />
        );
        converted[6] = heatMap;

        const barGraph = (
          <RoiBarGraph
            roiList={roiList}
            roiInfoObject={roiInfoObject}
            preTotal={totalPre}
            postTotal={totalPost}
          />
        );
        converted[7] = barGraph;

        const postQuery = {
          dataSet: query.dataSet, // <string> for the data set selected
          queryString: '/npexplorer/simpleconnections', // <neo4jquery string>
          // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
          visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
          plugin: pluginName, // <string> the name of this plugin.
          parameters: {
            dataset: query.dataSet,
            find_inputs: true,
            neuron_id: row[0]
          },
          title: `Connections to bodyID=${row[0]}`,
          menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
          processResults: this.processSimpleConnections
        };
        converted[3] = {
          value: totalPost,
          action: () => actions.submit(postQuery)
        };

        const preQuery = {
          dataSet: query.dataSet, // <string> for the data set selected
          queryString: '/npexplorer/simpleconnections', // <neo4jquery string>
          // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
          visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
          plugin: pluginName, // <string> the name of this plugin.
          parameters: {
            dataset: query.dataSet,
            find_inputs: false,
            neuron_id: row[0]
          },
          title: `Connections from bodyID=${row[0]}`,
          menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
          processResults: this.processSimpleConnections
        };
        converted[4] = {
          value: totalPre,
          action: () => actions.submit(preQuery)
        };
      }

      return converted;
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
    const { statusFilters, limitNeurons, preThreshold, postThreshold, qsParams } = this.state;
    const { inputROIs, outputROIs, neuronName } = qsParams;

    const parameters = {
      dataset: dataSet,
      input_ROIs: inputROIs,
      output_ROIs: outputROIs,
      statuses: statusFilters,
      all_segments: !limitNeurons
    };

    if (neuronName !== '') {
      if (/^\d+$/.test(neuronName)) {
        parameters.neuron_id = parseInt(neuronName, 10);
      } else {
        parameters.neuron_name = neuronName;
      }
    }

    if (preThreshold > 0) {
      parameters.pre_threshold = preThreshold;
    }

    if (postThreshold > 0) {
      parameters.post_threshold = postThreshold;
    }

    const query = {
      dataSet, // <string> for the data set selected
      queryString: '/npexplorer/findneurons', // <neo4jquery string>
      // cypherQuery: <string> if this is passed then use generic /api/custom/custom endpoint
      visType: 'SimpleTable', // <string> which visualization plugin to use. Default is 'table'
      visProps: { rowsPerPage: 25 },
      plugin: pluginName, // <string> the name of this plugin.
      parameters, // <object>
      title: `Neurons with inputs in [${inputROIs}] and outputs in [${outputROIs}]`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processResults
    };
    actions.submit(query);
    // redirect to the results page.
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
    return query;
  };

  handleChangeROIsIn = selected => {
    const { qsParams } = this.state;
    const { actions } = this.props;
    const oldParams = qsParams;
    const rois = selected.map(item => item.value);
    oldParams.inputROIs = rois;
    actions.setURLQs(SaveQueryString(`Query:${this.constructor.queryName}`, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  handleChangeROIsOut = selected => {
    const { qsParams } = this.state;
    const { actions } = this.props;
    const oldParams = qsParams;
    const rois = selected.map(item => item.value);
    oldParams.outputROIs = rois;
    actions.setURLQs(SaveQueryString(`Query:${this.constructor.queryName}`, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  addNeuron = event => {
    const { qsParams } = this.state;
    const { actions } = this.props;
    const oldParams = qsParams;
    const neuronName = event.target.value;
    oldParams.neuronName = neuronName;
    actions.setURLQs(SaveQueryString(`Query:${this.constructor.queryName}`, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  loadNeuronFilters = params => {
    this.setState({
      limitNeurons: params.limitNeurons,
      statusFilters: params.statusFilters,
      preThreshold: parseInt(params.preThreshold, 10),
      postThreshold: parseInt(params.postThreshold, 10)
    });
  };

  catchReturn = event => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.processRequest();
    }
  };

  // use this function to generate the form that will accept and
  // validate the variables for your Neo4j query.
  render() {
    const { classes, isQuerying, availableROIs, dataSet } = this.props;
    const { qsParams } = this.state;

    const inputOptions = availableROIs.map(name => ({
      label: name,
      value: name
    }));

    const inputValue = qsParams.inputROIs.map(roi => ({
      label: roi,
      value: roi
    }));

    const outputOptions = availableROIs.map(name => ({
      label: name,
      value: name
    }));

    const outputValue = qsParams.outputROIs.map(roi => ({
      label: roi,
      value: roi
    }));

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
        <FormControl fullWidth className={classes.formControl}>
          <NeuronHelp>
            <TextField
              label="Neuron name (optional)"
              multiline
              rows={1}
              fullWidth
              value={qsParams.neuronName}
              rowsMax={4}
              className={classes.textField}
              onChange={this.addNeuron}
              onKeyDown={this.catchReturn}
            />
          </NeuronHelp>
        </FormControl>
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

// data that will be provided to your form. Use it to build
// inputs, selections and for validation.
FindNeurons.propTypes = {
  actions: PropTypes.object.isRequired,
  availableROIs: PropTypes.arrayOf(PropTypes.string).isRequired,
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  urlQueryString: PropTypes.string.isRequired
};

const FindNeuronsState = state => ({
  isQuerying: state.query.isQuerying,
  urlQueryString: state.app.get('urlQueryString')
});

// The submit action which will accept your query, execute it and
// store the results for view plugins to display.
const FindNeuronsDispatch = dispatch => ({
  actions: {
    submit: query => {
      dispatch(submit(query));
    },
    skeletonAddandOpen: (id, dataSet) => {
      dispatch(skeletonAddandOpen(id, dataSet));
    },
    neuroglancerAddandOpen: (id, dataSet) => {
      dispatch(neuroglancerAddandOpen(id, dataSet));
    },
    setURLQs(querystring) {
      dispatch(setUrlQS(querystring));
    }
  }
});

// boiler plate for redux.
export default withRouter(
  withStyles(styles)(
    connect(
      FindNeuronsState,
      FindNeuronsDispatch
    )(FindNeurons)
  )
);
