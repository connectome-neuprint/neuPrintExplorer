/*
 * Supports simple, custom neo4j query.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import randomColor from 'randomcolor';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import ColorBox from '../visualization/ColorBox.react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';

import { submit } from 'actions/plugins';
import { skeletonAddandOpen } from 'actions/skeleton';
import { neuroglancerAddandOpen } from 'actions/neuroglancer';
import { getQueryString } from 'helpers/queryString';
import { sortRois } from '../MetaInfo.react';
import RoiHeatMap, { ColorLegend } from '../visualization/MiniRoiHeatMap.react';
import RoiBarGraph from '../visualization/MiniRoiBarGraph.react';

const pluginName = 'ROIConnectivity';

const styles = theme => ({
  clickable: {
    cursor: 'pointer'
  }
});

// default color for max connection
var WEIGHTCOLOR = '255,100,100,';

class ROIConnectivity extends React.Component {
  static get queryName() {
    return 'ROI Connectivity';
  }

  static get queryDescription() {
    return 'Extract connectivity matrix for a dataset';
  }

  processResults = (query, apiResponse) => {
    const { actions, classes } = this.props;
    const bodyInputCountsPerRoi = {};
    const { squareSize } = query.visProps;

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
      title: 'Neurons with inputs in: ' + inputRoi + ' and outputs in: ' + outputRoi,
      menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
      processResults: this.processRoiResults
    });

    // get set of all rois included in this query
    const roisInQuery = new Set();

    apiResponse.data.forEach(row => {
      const bodyId = row[0];
      const roiInfoObject = JSON.parse(row[1]);

      for (const roi in roiInfoObject) {
        roisInQuery.add(roi);
        // add numpost to provide size distribution
        if (roiInfoObject[roi].post > 0) {
          if (!(bodyId in bodyInputCountsPerRoi)) {
            bodyInputCountsPerRoi[bodyId] = [[roi, roiInfoObject[roi].post]];
          } else {
            bodyInputCountsPerRoi[bodyId].push([roi, roiInfoObject[roi].post]);
          }
        }
      }
    });

    const roiRoiWeight = {};
    const roiRoiCount = {};
    let maxValue = 1;

    // grab output and add table entry
    apiResponse.data.forEach(row => {
      const bodyId = row[0];
      const roiInfoObject = JSON.parse(row[1]);

      for (const outputRoi in roiInfoObject) {
        // create roi2roi based on input distribution
        const numOutputsInRoi = roiInfoObject[outputRoi].pre;
        // if body has pre in this roi and has post in any roi
        if (numOutputsInRoi > 0 && bodyId in bodyInputCountsPerRoi) {
          let totalInputs = 0;
          for (let i = 0; i < bodyInputCountsPerRoi[bodyId].length; i++) {
            totalInputs += bodyInputCountsPerRoi[bodyId][i][1];
          }

          for (let i = 0; i < bodyInputCountsPerRoi[bodyId].length; i++) {
            const inputRoi = bodyInputCountsPerRoi[bodyId][i][0];
            if (inputRoi === '' || totalInputs === 0) {
              continue;
            }
            const connectivityValueForBody =
              (numOutputsInRoi * bodyInputCountsPerRoi[bodyId][i][1] * 1.0) / totalInputs;
            const connectionName = inputRoi + '=>' + outputRoi;
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

    // make data table
    let data = [];

    const sortedRoisInQuery = Array.from(roisInQuery).sort(sortRois);

    for (let i = 0; i < sortedRoisInQuery.length; i++) {
      let inputRoiName = sortedRoisInQuery[i];
      let row = [];
      row.push(inputRoiName);
      for (let j = 0; j < sortedRoisInQuery.length; j++) {
        let outputRoiName = sortedRoisInQuery[j];
        let connectivityValue = 0;
        let connectivityCount = 0;
        let connectionName = inputRoiName + '=>' + outputRoiName;
        if (connectionName in roiRoiWeight) {
          connectivityValue = parseInt(roiRoiWeight[connectionName].toFixed());
          connectivityCount = roiRoiCount[connectionName];
        }

        let scaleFactor = 0;
        if (connectivityValue > 0) {
          scaleFactor = Math.log(connectivityValue) / Math.log(maxValue);
        }
        const weightColor = 'rgba(' + WEIGHTCOLOR + scaleFactor.toString() + ')';

        const neuronsQuery = neuronsInRoisQuery(inputRoiName, outputRoiName);

        row.push({
          value: (
            <div className={classes.clickable} onClick={() => actions.submit(neuronsQuery)}>
              <ColorBox
                margin={0}
                width={squareSize}
                height={squareSize}
                backgroundColor={weightColor}
                title={''}
                key={connectionName}
                text={
                  <div>
                    <Typography>{connectivityValue} </Typography>
                    <Typography variant="caption">{connectivityCount}</Typography>
                  </div>
                }
              />
            </div>
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

  handleShowSkeleton = (id, dataSet) => event => {
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
        title: `Neuron with id ` + bodyId,
        menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
        processResults: this.processResults
      };
    };

    const data = apiResponse.data.map(row => {
      return [
        {
          value: row[2],
          action: () => actions.submit(findNeuronQuery(row[2]))
        },
        row[1],
        row[3]
      ];
    });

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
      const roiInfoObject = JSON.parse(row[3]);
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
            preInSuperRois += roiInfoObject[roi]['pre'];
            postInSuperRois += roiInfoObject[roi]['post'];
          }
        });

        // add this after the other rois have been summed.
        // records # pre and post that are not in rois
        roiInfoObject['none'] = {
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
        '#post in ' + parameters.input_ROIs[0],
        '#pre in ' + parameters.output_ROIs[0],
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
    const { inputROIs, outputROIs, neuronsrc, statusFilters, limitBig } = this.state;

    const parameters = {
      dataset: dataSet,
      input_ROIs: inputROIs,
      output_ROIs: outputROIs,
      statuses: statusFilters
    };

    if (neuronsrc !== '') {
      if (isNaN(neuronsrc)) {
        parameters['neuron_name'] = neuronsrc;
      } else {
        parameters['neuron_id'] = parseInt(neuronsrc);
      }
    }

    if (limitBig) {
      parameters['pre_threshold'] = 2;
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
  };

  processRequest = () => {
    const { dataSet, actions, history } = this.props;

    const query = {
      dataSet,
      queryString: '/npexplorer/roiconnectivity',
      visType: 'HeatMapTable',
      visProps: { squareSize: 75 },
      plugin: pluginName,
      parameters: {
        dataset: dataSet,
        rois: this.props.availableROIs
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

  render() {
    return (
      <Button variant="contained" onClick={this.processRequest}>
        Submit
      </Button>
    );
  }
}

ROIConnectivity.propTypes = {
  datasetstr: PropTypes.string.isRequired,
  availableROIs: PropTypes.array.isRequired
};

const ROIConnectivityState = state => {
  return {
    isQuerying: state.query.isQuerying
  };
};

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
