import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import HeatMap from '@neuprint/react-heatmap';
import CircularProgress from '@mui/material/CircularProgress';
import withStyles from '@mui/styles/withStyles';

import { getQueryString, setSearchQueryString } from 'helpers/queryString';
import history from '../../history';

import HeatMapLoading from './HeatMapLoading.png';

const styles = () => ({
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-40px',
    marginLeft: '-40px'
  },
  loading: {
    position: 'relative',
    height: '100%',
    minHeight: '300px'
  },
  failed: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  }
});

function generateGraph(rois, dataSet, mouseOver, mouseOut, classes) {
  const roiNames = rois.roi_names;

  let maxWeight = 0;
  let maxCount = 0;

  if (!roiNames) {
    return (
      <div className={classes.loading}>
        <img src={HeatMapLoading} alt="heatmap loading in grey squares"/>
        <p className={classes.failed}>Failed to load roi information</p>
      </div>
    );
  }

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
        column: output,
        row: input,
        value: connectivityValue,
        label2: connectivityCount
      });
    });
  });

  const height = roiNames.length * 15 + 150;

  const clickHandler = (event) => {
    // set query as a tab in the url query string.
    setSearchQueryString({
      code: 'fn',
      ds: dataSet,
      pm: {
        dataset: dataSet,
        input_ROIs: [event.row],
        output_ROIs: [event.column]
      },
      visProps: { rowsPerPage: 25 }
    });
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
  }

  return (
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
      maxColor="#396a9f"
      textLabels={false}
    />
  );
}

function ConnectivityHeatMap(props) {
  const { dataSet, mouseOver, mouseOut, classes } = props;
  const [roiInfo, setRoiInfo] = useState(0);
  const [loadingError, setLoadingError] = useState(null);

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
        setLoadingError(error);
      });
  }, [dataSet]);

  if (loadingError) {
    return (
      <div className={classes.loading}>
        <img src={HeatMapLoading} alt="heatmap loading in grey squares"/>
        <p className={classes.failed}>Failed to load.</p>
      </div>
    );
  }

  if (roiInfo) {
    return generateGraph(roiInfo, dataSet, mouseOver, mouseOut, classes);
  }
  // return the loading statement
  return (
    <div className={classes.loading}>
      <img src={HeatMapLoading} alt="heatmap loading in grey squares"/>
      <CircularProgress className={classes.loader} />
    </div>
  );
}

ConnectivityHeatMap.propTypes = {
  dataSet: PropTypes.string.isRequired,
  mouseOver: PropTypes.func.isRequired,
  mouseOut: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ConnectivityHeatMap);
