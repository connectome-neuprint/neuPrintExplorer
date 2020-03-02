import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

import { SunburstFormatter, SkeletonFormatter } from '@neuprint/support';
import { addSearchToQuery } from 'helpers/queryString';

const styles = theme => ({
  typeName: {
    padding: theme.spacing(2)
  }
});

function NeuronOfTheDay(props) {
  const { dataSet, superROIs, classes } = props;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/cached/dailytype?dataset=${dataSet}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(result => result.json())
      .then(resp => {
        if (!('message' in resp)) {
          setData(resp);
        }
      })
      .catch(err => {
        setError(err);
      });
  }, [dataSet]);


  if (error) {
    return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper className={classes.typeName}>
          Cell Type of the Day - failed to load.
        </Paper>
      </Grid>
    </Grid>
    );
  }

  if (!data || !superROIs || !superROIs[dataSet]) {
     return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper className={classes.typeName}>
          Cell Type of the Day - Loading...
        </Paper>
      </Grid>
    </Grid>
    );
  }

  const newQuery = addSearchToQuery({
    code: 'ct',
    ds: dataSet,
    pm: {
      dataset: dataSet,
      cellType: data.info.typename
    }
  });

  const cellTypeLink = `/results?${newQuery}`;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Paper className={classes.typeName}>
          Cell Type of the Day - <Link to={cellTypeLink}>{data.info.typename}</Link>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant="body1">Example Neuron Morphology</Typography>}
            className="homeCardHeader"
          />
          <CardContent>
            <div style={{ height: '300px' }}>
              {data.skeleton && <SkeletonFormatter rawData={data.skeleton.data} />}
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} style={{ height: '400px' }}>
        <Card>
          <CardHeader
            title={
              <Typography variant="body1">
                Synapse Connectivity (broken down by cell type and region)
              </Typography>
            }
            className="homeCardHeader"
          />
          <CardContent>
            <SunburstFormatter
              bodyId={data.info.bodyid}
              rawData={data.connectivity.data}
              superROIs={superROIs[dataSet]}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

NeuronOfTheDay.propTypes = {
  dataSet: PropTypes.string.isRequired,
  superROIs: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
};

const NeuronState = state => ({
  superROIs: state.neo4jsettings.get('superROIs')
});

export default withStyles(styles)(
  connect(
    NeuronState,
    null
  )(NeuronOfTheDay)
);
