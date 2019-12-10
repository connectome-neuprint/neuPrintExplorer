import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import ROICompletenessChart from 'containers/visualization/ROICompletenessChart';
import Connectivity from 'components/Connectivity';

import DataSetLogo from './DataSetLogo';

function DataSetHome(props) {
  const { dataSet } = props;
  return (
    <Grid container spacing={24} justify="center">
      <Grid item sm={4}>
        <Grid container spacing={24} justify="center">
          <Grid item xs={12}>
            <DataSetLogo dataSet={dataSet} />
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
        <Connectivity dataSet={dataSet} />
      </Grid>
    </Grid>
  );
}

DataSetHome.propTypes = {
  dataSet: PropTypes.string.isRequired,
};

export default DataSetHome;
