import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import { ResponsiveHeatMapCanvas } from '@nivo/heatmap';

import { getQueryString, setSearchQueryString } from 'helpers/queryString';
import history from '../history';

import HeatMapLoading from './visualization/HeatMapLoading.png';

const styles = () => ({
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: '-40px',
    marginLeft: '-40px',
  },
  loading: {
    position: 'relative',
    height: '100%',
    minHeight: '850px',
  },
  failed: {
    position: 'absolute',
    minHeight: '850px',
    top: '50%',
    left: '50%',
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #000000',
    padding: '5px',
    borderRadius: '5px',
    zIndex: 1000,
  },
});

function Connectivity({ dataSet, classes }) {
  const [roiInfo, setRoiInfo] = useState(null);
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    const QueryUrl = `/api/cached/roiconnectivity?dataset=${dataSet}`;
    const QueryParameters = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      method: 'GET',
      credentials: 'include',
    };

    fetch(QueryUrl, QueryParameters)
      .then((result) => result.json())
      .then((resp) => {
        if (resp.error) {
          throw new Error(resp.error);
        }
        setRoiInfo(resp);
      })
      .catch((error) => {
        setLoadingError(error);
      });
  }, [dataSet]);

  const clickHandler = (event) => {
    // set query as a tab in the url query string.
    setSearchQueryString({
      code: 'fn',
      ds: dataSet,
      pm: {
        dataset: dataSet,
        input_ROIs: [event.serieId],
        output_ROIs: [event.data.x],
      },
      visProps: { rowsPerPage: 25 },
    });
    history.push({
      pathname: '/results',
      search: getQueryString(),
    });
  };

  if (loadingError) {
    return (
      <div className={classes.loading}>
        <img src={HeatMapLoading} alt="heatmap loading in grey squares" />
        <p className={classes.failed}>Failed to load.</p>
      </div>
    );
  }

  if (roiInfo) {
    let maxWeight = 0;
    let maxCount = 0;

    const roiNames = roiInfo.roi_names;
    // loop over to set weight color thresholds
    roiNames.forEach((input) => {
      roiNames.forEach((output) => {
        const connectionName = `${input}=>${output}`;
        const connectivityValue = roiInfo.weights[connectionName]
          ? roiInfo.weights[connectionName].weight
          : 0;
        const connectivityCount = roiInfo.weights[connectionName]
          ? roiInfo.weights[connectionName].count
          : 0;
        maxWeight = Math.max(connectivityValue, maxWeight);
        maxCount = Math.max(connectivityCount, maxCount);
      });
    });

    const data = [];

    roiNames.forEach((input) => {
      const row = {
        id: input,
        data: [],
      };

      roiNames.forEach((output) => {
        const connectionName = `${input}=>${output}`;
        const connectivityValue = roiInfo.weights[connectionName]
          ? roiInfo.weights[connectionName].weight
          : 0;
        const connectivityCount = roiInfo.weights[connectionName]
          ? roiInfo.weights[connectionName].count
          : 0;

        row.data.push({
          x: output,
          y: Math.log10(connectivityValue + 1),
          label1: connectivityValue,
          label2: connectivityCount,
        });
      });
      data.push(row);
    });

    const tooltip = (e) => (
      <div className={classes.tooltip}>
        <strong>
          {e.cell.serieId} &rarr; {e.cell.data.x}
        </strong>
        <br />
        {Math.round(e.cell.data.label1)}
        <br />
        {Math.round(e.cell.data.label2)}
      </div>
    );

    // set the height to be 20px for item in the data array
    const height = Math.max(15 * data.length, 800);

    return (
      <Card style={{ overflow: 'inherit' }}>
        <CardHeader
          title={<Typography variant="body1">Brain Region Connectivity</Typography>}
          className="homeCardHeader"
        />
        <CardContent style={{ height: `${height}px` }}>
          <ResponsiveHeatMapCanvas
            data={data}
            margin={{ top: 100, right: 10, bottom: 20, left: 100 }}
            valueFormat=">-.2s"
            axisTop={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -90,
              legend: '',
              legendOffset: 46,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: '',
              legendPosition: 'middle',
              legendOffset: 40,
            }}
            axisRight={null}
            colors={{
              type: 'sequential',
              scheme: 'blues',
              steps: 16,
            }}
            emptyColor="#cccccc"
            borderWidth={0}
            tooltip={tooltip}
            inactiveOpacity={0.4}
            borderColor="#000000"
            enableLabels={false}
            onClick={clickHandler}
            annotations={[]}
          />
        </CardContent>
      </Card>
    );
  }
  return (
    <div className={classes.loading}>
      <img src={HeatMapLoading} alt="heatmap loading in grey squares" />
      <CircularProgress className={classes.loader} />
    </div>
  );
}

Connectivity.propTypes = {
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Connectivity);
