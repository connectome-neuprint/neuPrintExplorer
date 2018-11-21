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

import { submit } from 'actions/plugins';
import { getQueryString } from 'helpers/queryString';
import ROIConnCell from '../../components/ROIConnCell.react';
import { sortRois } from '../MetaInfo.react';

const pluginName = 'ROIConnectivity';

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
    const bodyInputCountsPerRoi = {};
    const { squareSize } = query.visProps;

    // const neuronsInRoisQuery = (roi1, roi2) => {
    //   return {
    //     dataSet: query.parameters.dataset,
    //     queryString: '/npexplorer/findneurons',
    //     parameters: {
    //       dataset: query.parameters.dataset,
    //       input_ROIs: [roi1],
    //       output_ROIs: [roi2]
    //     },
    //     visType: 'SimpleTable',
    //     plugin: pluginName,
    //     title: 'Neurons with inputs in: ' + roi1 + ' and outputs in: ' + roi2,
    //     menuColor: randomColor({ luminosity: 'light', hue: 'random' }),
    //     processResults: this.processConnections
    //   };
    // };

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
        let weightColor = 'rgba(' + WEIGHTCOLOR + scaleFactor.toString() + ')';

        row.push({
          value: (
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
          ),
          // action: () => actions.submit(preQuery(bodyId)),
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
    }
  }
});

export default withRouter(
  connect(
    ROIConnectivityState,
    ROIConnectivityDispatch
  )(ROIConnectivity)
);
