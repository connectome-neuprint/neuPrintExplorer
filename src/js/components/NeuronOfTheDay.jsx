import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { SunburstFormatter, SkeletonFormatter } from '@neuprint/support';
import { addSearchToQuery } from 'helpers/queryString';

function NeuronOfTheDay(props) {
  const { dataSet, superROIs } = props;

  const [data, setData] = useState(null);

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
      });
  }, []);

  if (!data || !superROIs) {
    return <p>Loading...</p>;
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
    <Grid container spacing={24}>
      <Grid item xs={12}>
        <p>
          Neuron of the Day - <Link to={cellTypeLink}>{data.info.typename}</Link>
        </p>
      </Grid>
      <Grid item xs={12} style={{ height: '200px' }}>
        <SkeletonFormatter rawData={data.skeleton.data} />
      </Grid>
      <Grid item xs={12} style={{ height: '200px' }}>
        <SunburstFormatter
          bodyId={data.info.bodyid}
          rawData={data.connectivity.data}
          superROIs={superROIs[dataSet]}
        />
      </Grid>
    </Grid>
  );
}

NeuronOfTheDay.propTypes = {
  dataSet: PropTypes.string.isRequired,
  superROIs: PropTypes.object.isRequired
};

const NeuronState = state => ({
  superROIs: state.neo4jsettings.get('superROIs')
});

export default connect(
  NeuronState,
  null
)(NeuronOfTheDay);
