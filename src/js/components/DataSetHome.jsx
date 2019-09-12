import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ROICompletenessChart from 'containers/visualization/ROICompletenessChart';
import ConnectivityHeatMap from './visualization/ConnectivityHeatMap';

function DataSetHome(props) {
  const { dataSet } = props;
  return (
    <Grid container spacing={24} justify="center">
      <Grid item sm={4}>
        <Grid container spacing={24} justify="center">
          <Grid item xs={12}>
            <p>Meta Info for {dataSet}</p>
          </Grid>
          <Grid item xs={12}>
            <p>Stats for {dataSet}</p>
          </Grid>
          <Grid item xs={12}>
            <ROICompletenessChart dataSet={dataSet} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item sm={8}>
        <ConnectivityHeatMap dataSet={dataSet} />
      </Grid>
    </Grid>
  );
}

DataSetHome.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default DataSetHome;
