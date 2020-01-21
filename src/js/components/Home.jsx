/*
 * Home page contains basic information for the page.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';

import { getQueryObject } from 'helpers/queryString';
import { clearResultsCache } from 'actions/plugins';

import ServerInfoCard from './ServerInfoCard';
import DataSetLogo from './DataSetLogo';
import News from './News';
import Hints from './Hints';
import DataSetHome from './DataSetHome';
import NeuronOfTheDay from './NeuronOfTheDay';

import './Home.css';

const styles = theme => ({
  root: {
    flexWrap: 'wrap',
    display: 'flex',
    overflow: 'auto',
    padding: theme.spacing.unit * 3
  },
  roottext: {
    textAlign: 'center'
  },
  description: {
    margin: theme.spacing.unit * 2
  },
  container: {
    alignContent: 'flex-start'
  },
  sectionDivide: {
    width: '100%',
    margin: '2em 0'
  },
  video: {
    marginBottom: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

const useCacheClear = myAction => {
  useEffect(() => {
    myAction();
  }, []);
};

function Home(props) {
  const { classes, actions, loggedIn, datasetInfo, ...passedProps } = props;

  // if we have a dataset selected then show that homepage.
  const queryObject = getQueryObject();

  // clear out the cache if we no longer have the query result parameters in the url.
  // This prevents strange errors, eg: clicking on the heatmap on the homepage with a
  // cached result could cause the site to crash as it would try and use a cached
  // result for the wrong ROI. Or if there were 10 results in the cache and the url
  // was cleared of the result parameters, there is no way to start a new search,
  // because the site says there are too many results, but there is no way to clear
  // them without refreshing the page.
  if (!queryObject.qr) {
    useCacheClear(actions.clearResultsCache);
  }

  const dataSetNames = Object.keys(datasetInfo) || [];

  const defaultDS = dataSetNames.sort()[0];

  // show the loading page if we are logged in and there isn't a default dataset ready
  if (loggedIn && !defaultDS) {
    return (
      <div className={classes.root}>
        <p>Loading...</p>
      </div>
    );
  }

  if (loggedIn && (!queryObject.dataset || !queryObject.qt)) {
    return (
      <Redirect
        to={{
          pathname: '/',
          search: `?dataset=${defaultDS}&qt=findneurons`
        }}
      />
    );
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={24} justify="center" className={classes.container}>
        <Grid item xs={loggedIn ? 8 : 12} className={classes.roottext}>
          <Typography variant="h3">Analysis tools for connectomics</Typography>
          <Typography className={classes.description}>
            neuPrintExplorer provides tools to query and visualize connectomic data stored in{' '}
            <a href="https://github.com/janelia-flyem/neuPrint">neuPrint</a>, which uses a neo4j
            graph database.
          </Typography>
          {loggedIn && !queryObject.q && (
            <Typography variant="h6">
              Use the search icon <Icon>search</Icon> in the menu on the{' '}
              <Link to="/?q=1">left</Link> to query the database.
            </Typography>
          )}
        </Grid>
        {loggedIn && (
          <Grid item xs={4}>
            <DataSetLogo dataSet={queryObject.dataset} />
          </Grid>
        )}
        {loggedIn && (
          <Grid item sm={12} md={4}>
            <NeuronOfTheDay dataSet={queryObject.dataset} />
          </Grid>
        )}
        {queryObject.dataset && loggedIn && (
          <Grid item sm={12} md={8}>
            <DataSetHome dataSet={queryObject.dataset} />
          </Grid>
        )}
      </Grid>
      {!loggedIn && (
        <Grid item xs={12} className={classes.video}>
          <iframe
            title="Getting started"
            width="560"
            height="315"
            src="https://www.youtube.com/embed/I9O3rAwnU9M"
            srcDoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=https://www.youtube.com/embed/I9O3rAwnU9M?autoplay=1><img src=https://img.youtube.com/vi/I9O3rAwnU9M/hqdefault.jpg alt='Introduction to neuPrint Explorer'><span>▶</span></a>"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Grid>
      )}
      {queryObject.dataset && <Divider variant="middle" className={classes.sectionDivide} />}
      <Grid container spacing={24} justify="center" className={classes.container}>
        <Grid item xs={12} sm={12} md={6} lg={5}>
          <ServerInfoCard loggedIn={loggedIn} datasetInfo={datasetInfo} {...passedProps} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={5}>
          <Hints {...passedProps} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={5}>
          <News {...passedProps} />
        </Grid>
      </Grid>
    </div>
  );
}

const HomeState = state => ({
  neoServer: state.neo4jsettings.get('neoServer'),
  availableDatasets: state.neo4jsettings.get('availableDatasets'),
  datasetInfo: state.neo4jsettings.get('datasetInfo'),
  loggedIn: state.user.get('loggedIn'),
  publicState: state.neo4jsettings.get('publicState'),
  authLevel: state.user.get('userInfo').AuthLevel || 'none'
});

const HomeDispatch = dispatch => ({
  actions: {
    clearResultsCache: () => {
      dispatch(clearResultsCache());
    }
  }
});

Home.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  authLevel: PropTypes.string.isRequired,
  availableDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  datasetInfo: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  publicState: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(
  connect(
    HomeState,
    HomeDispatch
  )(Home)
);
