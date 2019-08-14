/*
 * Home page contains basic information for the page.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';

import { getQueryObject } from 'helpers/queryString';

import ServerInfoCard from './ServerInfoCard';
import News from './News';
import Hints from './Hints';
import DataSetHome from './DataSetHome';

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
  }
});

class Home extends React.Component {
  render() {
    const { classes, ...passedProps } = this.props;
    let redirectHome = false;
    if (window.location.pathname !== '/') {
      redirectHome = true;
    }

    // if we have a dataset selected then show that homepage.
    const queryObject = getQueryObject();

    return (
      <div className={classes.root}>
        {redirectHome ? <Redirect to="/" /> : <div />}
        <Grid container spacing={24} justify="center" className={classes.container}>
          <Grid item xs={2} />
          <Grid item xs={8} className={classes.roottext}>
            <Typography variant="h3">Analysis tools for connectomics</Typography>
            <Typography className={classes.description}>
              neuPrintExplorer provides tools to query and visualize connectomic data stored in{' '}
              <a href="https://github.com/janelia-flyem/neuPrint">neuPrint</a>, which uses a neo4j
              graph database.
            </Typography>
            <Typography variant="h6">
              Use the search icon <Icon>search</Icon> in the menu on the <Link to="/?q=1">left</Link> to query the database.
            </Typography>
          </Grid>
          <Grid item xs={2} />
          {queryObject.dataset && (
            <Grid item xs={12}>
              <DataSetHome dataSet={queryObject.dataset} />
            </Grid>
          )}
        </Grid>
        {queryObject.dataset && <Divider variant="middle" className={classes.sectionDivide} />}
        <Grid container spacing={24} justify="center" className={classes.container}>
          <Grid item xs={12} sm={12} md={6} lg={5}>
            <ServerInfoCard {...passedProps} />
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
}

const HomeState = state => ({
  neoServer: state.neo4jsettings.get('neoServer'),
  availableDatasets: state.neo4jsettings.get('availableDatasets'),
  datasetInfo: state.neo4jsettings.get('datasetInfo'),
  loggedIn: state.user.get('loggedIn'),
  publicState: state.neo4jsettings.get('publicState'),
  authLevel: state.user.get('userInfo').AuthLevel
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
  publicState: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(
  connect(
    HomeState,
    null
  )(Home)
);
