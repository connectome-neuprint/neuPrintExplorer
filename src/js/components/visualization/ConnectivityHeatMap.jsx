import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import HeatMap from '@neuprint/react-heatmap';

function generateGraph(rois, dataSet) {
  const neuronsInRoisQuery = (inputRoi, outputRoi) => ({
    dataSet,
    parameters: {
      dataset: dataSet,
      input_ROIs: [inputRoi],
      output_ROIs: [outputRoi]
    },
    pluginCode: 'fn'
  });

  const roiNames = rois.roi_names;

  let maxWeight = 0;
  let maxCount = 0;

  // loop over to set weight color thresholds
  roiNames.forEach(input => {
    roiNames.forEach(output => {
      const connectionName = `${input}=>${output}`;
      const connectivityValue = rois.weights[connectionName]
        ? rois.weights[connectionName].weight
        : 0;
      const connectivityCount = rois.weights[connectionName]
        ? rois.weights[connectionName].count
        : 0;
      maxWeight = Math.max(connectivityValue, maxWeight);
      maxCount = Math.max(connectivityCount, maxCount);
    });
  });

  const data = [];

  roiNames.forEach(input => {
    roiNames.forEach(output => {
      const connectionName = `${input}=>${output}`;
      const connectivityValue = rois.weights[connectionName]
        ? rois.weights[connectionName].weight
        : 0;
      const connectivityCount = rois.weights[connectionName]
        ? rois.weights[connectionName].count
        : 0;


      data.push({column: input, row: output, value: connectivityValue, label2: connectivityCount});
    });
  });

  const height = (roiNames.length * 15) + 150;

  return <HeatMap data={data} xLabels={roiNames.slice().reverse()} yLabels={roiNames} height={height} width={height} />;
}

function ConnectivityHeatMap(props) {
  const { dataSet, actions } = props;
  const [roiInfo, setRoiInfo] = useState(0);

  useEffect(() => {
    const QueryUrl = `/api/cached/roiconnectivity?dataset=${dataSet}`;
    const QueryParameters = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      method: 'GET',
      credentials: 'include'
    };

    fetch(QueryUrl, QueryParameters)
      .then(result => result.json())
      .then(resp => {
        if (resp.error) {
          throw new Error(resp.error);
        }
        setRoiInfo(resp);
      })
      .catch(error => {
        actions.metaInfoError(error);
      });
  }, [dataSet]);

  if (roiInfo) {
    return generateGraph(roiInfo, dataSet);
  }
  // return the loading statement
  return <p>loading ConnectivityHeatMap for {dataSet}</p>;
}

ConnectivityHeatMap.propTypes = {
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired
};

export default ConnectivityHeatMap;
