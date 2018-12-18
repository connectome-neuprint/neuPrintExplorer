/*
 * Supports simple, custom neo4j query.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Select from 'react-select';
import randomColor from 'randomcolor';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import { submit } from 'actions/plugins';
import { skeletonAddandOpen } from 'actions/skeleton';
import { setUrlQS } from 'actions/app';
import { neuroglancerAddandOpen } from 'actions/neuroglancer';
import { getQueryString } from 'helpers/queryString';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import ColorBox from '../visualization/ColorBox';
import { sortRois } from '../MetaInfo';
import RoiHeatMap, { ColorLegend } from '../visualization/MiniRoiHeatMap';
import RoiBarGraph from '../visualization/MiniRoiBarGraph';

const pluginName = 'ROIConnectivity';

const styles = theme => ({
  clickable: {
    cursor: 'pointer'
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0'
  },
  button: {
    padding: 0,
    border: 0,
    cursor: 'pointer'
  }
});

// default color for max connection
const WEIGHTCOLOR = '255,100,100,';

class ROIConnectivity extends React.Component {
  constructor(props) {
    super(props);
    const { urlQueryString, dataSet } = this.props;
    const initqsParams = {
      rois: []
    };
    const qsParams = LoadQueryString(
      `Query:${this.constructor.queryName}`,
      initqsParams,
      urlQueryString
    );

    // set the default state for the query input.
    this.state = {
      qsParams,
      dataSet, // eslint-disable-line react/no-unused-state
      queryName: this.constructor.queryName // eslint-disable-line react/no-unused-state
    };
  }

  static get queryName() {
    return 'ROI Connectivity';
  }

  static get queryDescription() {
    return 'Extract connectivity matrix for a dataset';
  }

  static getDerivedStateFromProps = (props, state) => {
    // if dataset changes, clear the selected rois and statuses

    // eslint issues: https://github.com/yannickcr/eslint-plugin-react/issues/1751
    if (props.dataSet !== state.dataSet) {
      const oldParams = state.qsParams;
      oldParams.rois = [];
      props.actions.setURLQs(SaveQueryString(`Query:${state.queryName}`, oldParams));
      state.dataSet = props.dataSet; // eslint-disable-line no-param-reassign
      return state;
    }
    return null;
  };

  processResults = (query, apiResponse) => {
    const { actions, classes, availableROIs } = this.props;
    const bodyInputCountsPerRoi = {};
    const { squareSize } = query.visProps;
    let { rois } = query.parameters;

    // if no selected rois, should include all rois
    if (!rois || rois.length === 0) {
      rois = availableROIs;
    }

    const neuronsInRoisQuery = (inputRoi, outputRoi) => ({
      dataSet: query.parameters.dataset,
      queryString: '/npexplorer/findneurons',
      parameters: {
        dataset: query.parameters.dataset,
        input_ROIs: [inputRoi],
        output_ROIs: [outputRoi]
      },
      visType: 'SimpleTable',
      plugin: pluginName,
      title: `Neurons with inputs in: ${inputRoi} and outputs in: ${outputRoi}`,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processRoiResults
    });

    // get set of all rois included in this query
    const roisInQuery = new Set();

    apiResponse.data.forEach(row => {
      const bodyId = row[0];
      const roiInfoObject = row[1] ? JSON.parse(row[1]) : '{}';

      Object.entries(roiInfoObject).forEach(roi => {
        const [name, data] = roi;
        roisInQuery.add(name);
        if (data.post > 0) {
          if (!(bodyId in bodyInputCountsPerRoi)) {
            bodyInputCountsPerRoi[bodyId] = [[name, data.post]];
          } else {
            bodyInputCountsPerRoi[bodyId].push([name, data.post]);
          }
        }
      });
    });

    const roiRoiWeight = {};
    const roiRoiCount = {};
    let maxValue = 1;

    // grab output and add table entry
    apiResponse.data.forEach(row => {
      const bodyId = row[0];
      const roiInfoObject = row[1] ? JSON.parse(row[1]) : '{}';

      Object.entries(roiInfoObject).forEach(roi => {
        const [outputRoi, data] = roi;
        // create roi2roi based on input distribution
        const numOutputsInRoi = data.pre;
        // if body has pre in this roi and has post in any roi
        if (numOutputsInRoi > 0 && bodyId in bodyInputCountsPerRoi) {
          let totalInputs = 0;
          for (let i = 0; i < bodyInputCountsPerRoi[bodyId].length; i += 1) {
            totalInputs += bodyInputCountsPerRoi[bodyId][i][1];
          }

          for (let i = 0; i < bodyInputCountsPerRoi[bodyId].length; i += 1) {
            const inputRoi = bodyInputCountsPerRoi[bodyId][i][0];
            if (inputRoi !== '' && totalInputs !== 0) {
              const connectivityValueForBody =
                (numOutputsInRoi * bodyInputCountsPerRoi[bodyId][i][1] * 1.0) / totalInputs;
              const connectionName = `${inputRoi}=>${outputRoi}`;
              if (connectionName in roiRoiWeight) {
                roiRoiWeight[connectionName] += connectivityValueForBody;
                roiRoiCount[connectionName] += 1;
              } else {
                roiRoiWeight[connectionName] = connectivityValueForBody;
                roiRoiCount[connectionName] = 1;
              }
              const currentValue = roiRoiWeight[connectionName];
              if (currentValue > maxValue) {
                maxValue = currentValue;
              }
            }
          }
        }
      });
    });

    // make data table
    const data = [];

    const sortedRoisInQuery = Array.from(roisInQuery)
      .sort(sortRois)
      .filter(roi => rois.includes(roi));

    for (let i = 0; i < sortedRoisInQuery.length; i += 1) {
      const inputRoiName = sortedRoisInQuery[i];
      const row = [];
      row.push(inputRoiName);
      for (let j = 0; j < sortedRoisInQuery.length; j += 1) {
        const outputRoiName = sortedRoisInQuery[j];
        let connectivityValue = 0;
        let connectivityCount = 0;
        const connectionName = `${inputRoiName}=>${outputRoiName}`;
        if (connectionName in roiRoiWeight) {
          connectivityValue = parseInt(roiRoiWeight[connectionName].toFixed(), 10);
          connectivityCount = roiRoiCount[connectionName];
        }

        let scaleFactor = 0;
        if (connectivityValue > 0) {
          scaleFactor = Math.log(connectivityValue) / Math.log(maxValue);
        }
        const weightColor = `rgba(${WEIGHTCOLOR}${scaleFactor.toString()})`;

        const neuronsQuery = neuronsInRoisQuery(inputRoiName, outputRoiName);

        row.push({
          value: (
            <button
              type="button"
              className={classes.button}
              onClick={() => actions.submit(neuronsQuery)}
            >
              <ColorBox
                margin={0}
                width={squareSize}
                height={squareSize}
                backgroundColor={weightColor}
                title=""
                key={connectionName}
                text={
                  <div>
                    <Typography>{connectivityValue} </Typography>
                    <Typography variant="caption">{connectivityCount}</Typography>
                  </div>
                }
              />
            </button>
          ),
          sortBy: { rowValue: inputRoiName, columeValue: outputRoiName },
          csvValue: connectivityValue,
          uniqueId: connectionName
        });
      }
      data.push(row);
    }

    return {
      columns: ['', ...sortedRoisInQuery],
      data,
      debug: apiResponse.debug
    };
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

  processRoiResults = (query, apiResponse) => {
    const { actions, classes } = this.props;
    const { parameters } = query;

    const data = apiResponse.data.map(row => {
      const hasSkeleton = row[8];
      const roiInfoObject = row[3] ? JSON.parse(row[3]) : '{}';
      const inputRoi = parameters.input_ROIs[0];
      const outputRoi = parameters.output_ROIs[0];

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
        roiInfoObject[inputRoi].post,
        roiInfoObject[outputRoi].pre,
        row[4],
        '',
        ''
      ];

      // make sure none is added to the rois list.
      row[7].push('none');
      const roiList = row[7];
      const totalPre = row[5];
      const totalPost = row[6];

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
        converted[8] = heatMap;

        const barGraph = (
          <RoiBarGraph
            roiList={roiList}
            roiInfoObject={roiInfoObject}
            preTotal={totalPre}
            postTotal={totalPost}
          />
        );
        converted[9] = barGraph;

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
        `#post in ${parameters.input_ROIs[0]}`,
        `#pre in ${parameters.output_ROIs[0]}`,
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

  processRequest = () => {
    const { dataSet, actions, history } = this.props;
    const { qsParams } = this.state;
    const { rois } = qsParams;

    const query = {
      dataSet,
      queryString: '/npexplorer/roiconnectivity',
      visType: 'HeatMapTable',
      visProps: { squareSize: 75 },
      plugin: pluginName,
      parameters: {
        dataset: dataSet,
        rois
      },
      title: 'ROI Connectivity (column: inputs, row: outputs)',
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

  handleChangeROIs = selected => {
    const { qsParams } = this.state;
    const { actions } = this.props;
    const oldParams = qsParams;
    const rois = selected.map(item => item.value);
    oldParams.rois = rois;
    actions.setURLQs(SaveQueryString(`Query:${this.constructor.queryName}`, oldParams));
    this.setState({
      qsParams: oldParams
    });
  };

  render() {
    const { isQuerying, availableROIs, classes } = this.props;
    const { qsParams } = this.state;
    const { rois } = qsParams;

    const roiOptions = availableROIs.map(name => ({
      label: name,
      value: name
    }));

    const roiValue = rois.map(roi => ({
      label: roi,
      value: roi
    }));

    return (
      <div>
        <InputLabel htmlFor="select-multiple-chip">ROIs (optional)</InputLabel>
        <Select
          className={classes.select}
          isMulti
          value={roiValue}
          onChange={this.handleChangeROIs}
          options={roiOptions}
          closeMenuOnSelect={false}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={isQuerying}
          onClick={this.processRequest}
        >
          Submit
        </Button>
        <br />
        <br />
        <Typography style={{ fontWeight: 'bold' }}>Description</Typography>
        <Typography variant="body2">
          Within each cell of the matrix, the top number represents connections from ROI X to ROI Y
          defined as the number of synapses from neurons that have inputs in X and outputs in Y. The
          number represents the number of outputs from these neurons in Y weighted by the proportion
          of inputs that are in X. The bottom number is the number of neurons with at least one
          input in X and one output in Y. In some cases, the bottom number can be larger than the
          top number if most of the neuron inputs are not in X.
        </Typography>
      </div>
    );
  }
}

ROIConnectivity.propTypes = {
  dataSet: PropTypes.string.isRequired,
  availableROIs: PropTypes.arrayOf(PropTypes.string).isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  urlQueryString: PropTypes.string.isRequired
};

const ROIConnectivityState = state => ({
  isQuerying: state.query.isQuerying,
  urlQueryString: state.app.get('urlQueryString')
});

const ROIConnectivityDispatch = dispatch => ({
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

export default withRouter(
  withStyles(styles)(
    connect(
      ROIConnectivityState,
      ROIConnectivityDispatch
    )(ROIConnectivity)
  )
);
