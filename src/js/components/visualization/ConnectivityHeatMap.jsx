import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import HeatMap from '@neuprint/react-heatmap';

import { getQueryString, setSearchQueryString } from 'helpers/queryString';
import history from '../../history';

function generateGraph(rois, dataSet, mouseOver, mouseOut) {
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

      data.push({
        column: input,
        row: output,
        value: connectivityValue,
        label2: connectivityCount
      });
    });
  });

  const height = roiNames.length * 15 + 150;

  function clickHandler(event) {
    // set query as a tab in the url query string.
    setSearchQueryString({
      code: 'fn',
      ds: dataSet,
      pm: {
        dataset: dataSet,
        input_ROIs: [event.column],
        output_ROIs: [event.row]
      },
      visProps: { rowsPerPage: 25 }
    });
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
  };

  return (
    <React.Fragment>
      <HeatMap
        data={data}
        xLabels={roiNames.slice().reverse()}
        yLabels={roiNames}
        height={height}
        width={height}
        onClick={clickHandler}
        onMouseOver={mouseOver}
        onFocus={mouseOver}
        onMouseOut={mouseOut}
        onBlur={mouseOver}
      />
    </React.Fragment>
  );
}

function ConnectivityHeatMap(props) {
  const { dataSet, actions, mouseOver, mouseOut } = props;
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
    return generateGraph(roiInfo, dataSet, mouseOver, mouseOut);
  }
  // return the loading statement
  return <p>loading ConnectivityHeatMap for {dataSet}</p>;
}

ConnectivityHeatMap.propTypes = {
  dataSet: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  mouseOver: PropTypes.func.isRequired,
  mouseOut: PropTypes.func.isRequired,
};

export default ConnectivityHeatMap;
