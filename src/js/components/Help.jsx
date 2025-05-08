/*
 * Help page provides documentation.
 */
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
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
    height: "100%"
  },
  citation: {
    padding: '1em',
  },
  info: {
    marginBottom: "1em"
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
      <Grid container spacing={2} className={classes.info}>
        <Grid item sm={12} md={4}>
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
        </Grid>
        <Grid item sm={12} md={8}>
          <Paper className={classes.citation}>
            <Typography variant="h5">Cite this work:</Typography>
            <p>
              <b>neuPrint: An open access tool for EM connectomics.</b>
            </p>
            <i>
              Plaza SM, Clements J, Dolafi T, Umayam L, Neubarth NN, Scheffer LK and Berg S
            </i>
            <p>
              Front. Neuroinform. 16:896292. doi: <a href="https://doi.org/10.1101/2020.01.16.909465">10.3389/fninf.2022.896292</a>
            </p>
            <p>
              <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
                <img
                  alt="Creative Commons License"
                  style={{ borderWidth: 0 }}
                  src="https://i.creativecommons.org/l/by/4.0/88x31.png"
                />
              </a>{' '}
              This work is licensed under a{' '}
              <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
                Creative Commons Attribution 4.0 International License
              </a>
              .
            </p>
          </Paper>
        </Grid>
      </Grid>

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
