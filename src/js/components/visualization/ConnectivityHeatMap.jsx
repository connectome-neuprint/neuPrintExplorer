import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import { HeatMapTable } from '@neuprint/views';

import ColorBox from './ColorBox';

const WEIGHTCOLOR = '255,100,100,';
const squareSize = 40;

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

  // make data table
  const data = [];
  roiNames.forEach(input => {
    const row = [];
    // set the row title
    row.push(input);

    // fill out the data blocks for each column
    roiNames.forEach(output => {
      const neuronsQuery = neuronsInRoisQuery(input, output);
      const connectionName = `${input}=>${output}`;
      const connectivityValue = rois.weights[connectionName]
        ? rois.weights[connectionName].weight
        : 0;
      const connectivityCount = rois.weights[connectionName]
        ? rois.weights[connectionName].count
        : 0;

      const scaleFactor = Math.log(connectivityValue) / Math.log(maxWeight);
      const weightColor = `rgba(${WEIGHTCOLOR}${scaleFactor})`;
      row.push({
        value: (
          <button type="button" className="heatmapbutton" onClick={() => console.log(neuronsQuery)}>
            <ColorBox
              margin={0}
              width={squareSize}
              height={squareSize}
              backgroundColor={weightColor}
              title=""
              key={connectionName}
              text={
                <div>
                  <Typography>{Math.round(connectivityValue, 0)}</Typography>
                  <Typography variant="caption">{connectivityCount}</Typography>
                </div>
              }
            />
          </button>
        ),
        sortBy: { rowValue: input, columeValue: output },
        csvValue: connectivityValue,
        uniqueId: connectionName
      });
    });
    data.push(row);
  });

  return <HeatMapTable query={{
    result: {
      columns: ['', ...roiNames],
      data
    },
    visProps: {
      squareSize
    }
  }} />
}

function ConnectivityHeatMap(props) {
  const { dataSet } = props;
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
        console.log(error);
      });
  }, [dataSet]);

  if (roiInfo) {
    return generateGraph(roiInfo, dataSet);
  }
  // return the loading statement
  return <p>loading ConnectivityHeatMap for {dataSet}</p>;
}

ConnectivityHeatMap.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default ConnectivityHeatMap;
