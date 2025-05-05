/*
 * Home page contains basic information for the page.
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import Typography from '@mui/material/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import CallMadeIcon from '@mui/icons-material/CallMade';
import Divider from '@mui/material/Divider';

import { getQueryObject } from 'helpers/queryString';
import { clearResultsCache } from 'actions/plugins';
import { metaInfoError } from 'plugins/support';

import ServerInfoCard from './ServerInfoCard';
import DataSetLogo from './DataSetLogo';
import News from './News';
import Hints from './Hints';
import DataSetHome from './DataSetHome';
import NeuronOfTheDay from './NeuronOfTheDay';

import './Home.css';

const styles = (theme) => ({
  root: {
    flexWrap: 'wrap',
    display: 'flex',
    overflow: 'auto',
    padding: theme.spacing(3),
  },
  roottext: {
    textAlign: 'center',
  },
  description: {
    margin: theme.spacing(2),
  },
  container: {
    alignContent: 'flex-start',
  },
  sectionDivide: {
    width: '100%',
    margin: '2em 0',
  },
  video: {
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  menupointer: {
    transform: 'rotate(270deg)',
  },
});

function Home(props) {
  const { classes, actions, loggedIn, datasetInfo, ...rest } = props;

  const { authLevel, publicState } = rest;

  // if we have a dataset selected then show that homepage.
  const queryObject = getQueryObject();

  // clear out the cache if we no longer have the query result parameters in the url.
  // This prevents strange errors, eg: clicking on the heatmap on the homepage with a
  // cached result could cause the site to crash as it would try and use a cached
  // result for the wrong ROI. Or if there were 10 results in the cache and the url
  // was cleared of the result parameters, there is no way to start a new search,
  // because the site says there are too many results, but there is no way to clear
  // them without refreshing the page.
  useEffect(() => {
    if (!queryObject.qr) {
      actions.clearResultsCache();
    }
  }, [actions, queryObject.qr]);

  const dataSetNames = Object.keys(datasetInfo) || [];

  const defaultDS = dataSetNames
    // set the default dataset by using the last modified date.
    .sort((a, b) => new Date(datasetInfo[b].lastmod) - new Date(datasetInfo[a].lastmod))
    .filter((name) => datasetInfo[name].hidden === false)[0];

  if (loggedIn && (!queryObject.dataset || !queryObject.qt) && defaultDS) {
    return (
      <Redirect
        to={{
          pathname: '/',
          search: `?dataset=${defaultDS}&qt=findneurons`,
        }}
      />
    );
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={4} justifyContent="center" className={classes.container}>
        <Grid item xs={loggedIn ? 8 : 12} className={classes.roottext}>
          <Typography variant="h3">Analysis tools for connectomics and more</Typography>
          <Typography className={classes.description}>
            neuPrintExplorer provides tools to query and visualize inter- &amp; intra- cellular
            interactions data stored in{' '}
            <a href="https://github.com/janelia-flyem/neuPrint">neuPrint+</a>, which uses a neo4j
            graph database.
          </Typography>
          {loggedIn && !queryObject.q && (
            <Typography variant="h6">
              <CallMadeIcon className={classes.menupointer} /> Use the search icon{' '}
              <Icon>search</Icon> to query the database.
            </Typography>
          )}
        </Grid>
        {loggedIn && (
          <Grid item xs={4}>
            <DataSetLogo dataSet={queryObject.dataset} datasetInfo={datasetInfo} />
          </Grid>
        )}
        {loggedIn && (authLevel.match(/^readwrite|admin$/) || publicState) ? (
          <Grid item sm={12} md={4}>
            <NeuronOfTheDay dataSet={queryObject.dataset} actions={actions} />
          </Grid>
        ) : null}
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
            srcDoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=https://www.youtube.com/embed/I9O3rAwnU9M?autoplay=1><img src=https://img.youtube.com/vi/I9O3rAwnU9M/hqdefault.jpg alt='Introduction to neuPrintExplorer'><span>▶</span></a>"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Grid>
      )}
      {queryObject.dataset && <Divider variant="middle" className={classes.sectionDivide} />}
      <Grid container spacing={4} justifyContent="center" className={classes.container}>
        <Grid item xs={12} sm={12} md={6} lg={5}>
          <ServerInfoCard loggedIn={loggedIn} datasetInfo={datasetInfo} {...rest} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={5}>
          <Hints />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={5}>
          <News />
        </Grid>
      </Grid>
      <p style={{ textAlign: 'center', width: '100%' }}>
        <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
          <img
            alt="Creative Commons License"
            style={{ borderWidth: 0 }}
            src="https://i.creativecommons.org/l/by/4.0/88x31.png"
          />
        </a>
        <br />
        This work is licensed under a{' '}
        <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
          Creative Commons Attribution 4.0 International License
        </a>
        .
      </p>
    </div>
  );
}

const HomeState = (state) => ({
  neoServer: state.neo4jsettings.get('neoServer'),
  availableDatasets: state.neo4jsettings.get('availableDatasets'),
  datasetInfo: state.neo4jsettings.get('datasetInfo'),
  loggedIn: state.user.get('loggedIn'),
  publicState: state.neo4jsettings.get('publicState'),
  authLevel: state.user.get('userInfo').AuthLevel || 'none',
});

const HomeDispatch = (dispatch) => ({
  actions: {
    clearResultsCache: () => {
      dispatch(clearResultsCache());
    },
    metaInfoError: error => {
      dispatch(metaInfoError(error));
    },
  },
});

Home.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  authLevel: PropTypes.string.isRequired,
  availableDatasets: PropTypes.arrayOf(PropTypes.string).isRequired,
  datasetInfo: PropTypes.object.isRequired,
  neoServer: PropTypes.string.isRequired,
  publicState: PropTypes.bool.isRequired,
  actions: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(connect(HomeState, HomeDispatch)(Home));
