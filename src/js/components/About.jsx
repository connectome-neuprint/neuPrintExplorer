/* global VERSION */
import React from 'react';

import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import { connect } from 'react-redux';
import withStyles from '@mui/styles/withStyles';

import AboutIssueList from './AboutIssueList';
import GithubErrorBoundary from './GithubErrorBoundary';

const styles = theme => ({
  root: {
    flexGrow: 1,
    overflow: 'auto',
    margin: theme.spacing(2)
  },
  centered: {
    textAlign: 'center'
  },
  spaced: {
    margin: '1em 0'
  },
  contactIcon: {
    verticalAlign: 'middle'
  }
});

function newIssue(e) {
  e.preventDefault();
  window.open(
    'https://github.com/connectome-neuprint/neuPrintExplorer/issues/new?labels=user&body=(Please%20provide%20additional%20details)'
  );
}

function About({ classes, token, appDB }) {
  return (
    <div className={classes.root}>
      <Typography variant="h3" className={classes.centered}>
        neuPrintExplorer
      </Typography>
      <Typography variant="body1" className={classes.centered}>
        Version: {VERSION}
      </Typography>
      <Divider className={classes.spaced} sx={{
        opacity: "0.6"
      }} />
      <Typography variant="h6">About</Typography>
      <Typography variant="body1" className={classes.spaced}>
        neuPrintExplorer is web based tool to query and visualize inter and intra cellular
        interaction data stored in neuPrint+, a neo4j graph database.{' '}
      </Typography>
      <Typography variant="h6">Log an issue</Typography>
      <Typography variant="body1" className={classes.spaced}>
        Note that you currently need to have a GitHub account to submit issues.
        <br />
        <Button variant="contained" color="primary" className={classes.button} onClick={newIssue}>
          New issue
        </Button>
      </Typography>
      <Typography variant="h6">Open issue list</Typography>
      <GithubErrorBoundary>
        <AboutIssueList token={token} appDB={appDB} />
      </GithubErrorBoundary>
      <Typography variant="h6">Contact us</Typography>
      <Typography variant="body1" className={classes.spaced}>
        <Icon className={classes.contactIcon}>mail_outline</Icon>
        <a href="mailto:neuprint@janelia.hhmi.org">neuprint@janelia.hhmi.org</a>
      </Typography>
    </div>
  );
}

const AboutState = state => ({
  token: state.user.get('token'),
  appDB: state.app.get('appDB')
});

About.propTypes = {
  classes: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  appDB: PropTypes.string.isRequired
};

export default withStyles(styles)(connect(AboutState, null)(About));
