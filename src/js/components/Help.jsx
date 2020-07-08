/*
 * Help page provides documentation.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { Switch, Route, Link } from 'react-router-dom';
import HelpMain from './Help/HelpMain';
import HelpDetails from './Help/Videos';
import HelpApi from './Help/Api';
import HelpBrainRegions from './Help/BrainRegions';
import CypherExamples from './Help/CypherExamples';

const styles = theme => ({
  root: {
    overflow: 'scroll',
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: theme.spacing(3)
  },
  roottext: {
    flex: 1
  },
  flex: {
    flex: 1,
    padding: '1em'
  },
  graphModel: {
    background: '#fff'
  },
  secroot: {
    position: 'relative',
    width: '100%',
    height: '600px'
  },
  img: {
    maxWidth: '100%',
    minWidth: '500px'
  },
  bold: { fontWeight: 'bold', display: 'inline' },
  contact: {
    padding: '1em',
    marginBottom: '1em'
  }
});

const locationValueMap = {
  '/help': 0,
  '/help/api': 1,
  '/help/videos': 2,
  '/help/brainregions': 3,
  '/help/cypherexamples': 4
};

function Help(props) {
  const { classes, location } = props;

  const value = locationValueMap[location.pathname];
  const queryString = location.search;

  return (
    <div className={classes.root}>
      <Paper className={classes.contact}>
        <Typography variant="h5">Contact us:</Typography>
        <ul>
          <li>
            Email: <a href="mailto:neuprint@janelia.hhmi.org">neuprint@janelia.hhmi.org</a>
          </li>
          <li>
            Issues:{' '}
            <a href="https://github.com/connectome-neuprint/neuPrintExplorer/issues">
              Github Issues
            </a>
          </li>
          <li>
            Forum: <a href="https://groups.google.com/forum/#!forum/neuprint">Google Groups</a>
          </li>
        </ul>
      </Paper>

      <AppBar position="static" color="default">
        <Tabs value={value}>
          <Tab label="Overview" component={Link} to={{ pathname: '/help', search: queryString }} />
          <Tab
            label="Programmer's Interface"
            component={Link}
            to={{ pathname: '/help/api', search: queryString }}
          />
          <Tab
            label="Video Tutorials"
            component={Link}
            to={{ pathname: '/help/videos', search: queryString }}
          />
          <Tab
            label="Brain Regions"
            component={Link}
            to={{ pathname: '/help/brainregions', search: queryString }}
          />
          <Tab
            label="Cypher Examples"
            component={Link}
            to={{ pathname: '/help/cypherexamples', search: queryString }}
          />
        </Tabs>
      </AppBar>

      <Switch>
        <Route exact path="/help">
          <HelpMain />
        </Route>
        <Route path="/help/api">
          <HelpApi />
        </Route>
        <Route path="/help/videos">
          <HelpDetails />
        </Route>
        <Route path="/help/brainregions">
          <HelpBrainRegions />
        </Route>
        <Route path="/help/cypherexamples">
          <CypherExamples />
        </Route>
      </Switch>
    </div>
  );
}

Help.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
    pathname: PropTypes.string.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Help);
