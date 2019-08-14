import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';

class DataSetHome extends React.Component {
  render() {
    const { dataSet } = this.props;
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
              <p>ROI connectivity table for {dataSet}</p>
              <ul>
                <li>name</li>
                <li>completeness</li>
                <li>description</li>
                <li>virtual flybrain link</li>
                <li>pre / post synaptic regions</li>
                <li>tbar density</li>
                <li>neuron count</li>
                <li>etc.</li>
              </ul>
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={8}>
          <p>ROI Connectivity Graph</p>
        </Grid>
      </Grid>
    );
  }
}

DataSetHome.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default DataSetHome;
