/*
 * Side drawer pop out for queries.
 */

import React, { Suspense } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';

import QueryTypeSelection from './QueryTypeSelection';
import { getSiteParams } from '../helpers/queryString';

const Query = React.lazy(() => import('./Query'));

const drawerWidth = 400;

// adapted from material ui example
const styles = theme => ({
  drawerPaperQuery: {
    height: '100vh',
    overflow: 'auto',
    position: 'relative',
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar,
  query: {
    overflow: 'auto',
    flex: 'auto'
  },
  loggedOut: {
    margin: '1em'
  }
});

function QueryDrawer({ classes, location, loggedIn }) {
  const qsParams = getSiteParams(location);

  const openQuery = qsParams.get('q');
  const fullscreen = qsParams.get('rt');

  const content = loggedIn ? (
    <div className={classes.query}>
      <Collapse in={openQuery === '2'} timeout="auto" unmountOnExit>
        <QueryTypeSelection />
      </Collapse>
      <Suspense fallback={<div>loading...</div>}>
        <Query />
      </Suspense>
    </div>
  ) : (
    <Typography className={classes.loggedOut} variant="h6">
      Please login to query the data.
    </Typography>
  );

  if (fullscreen !== 'full') {
    if (openQuery >= '1') {
      return (
        <div>
          <Drawer
            variant="permanent"
            classes={{
              paper: classes.drawerPaperQuery
            }}
          >
            <div className={classes.toolbar} />
            {content}
          </Drawer>
        </div>
      );
    }
  }
  return null;
};

QueryDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  loggedIn: PropTypes.bool.isRequired
};

const QueryDrawerState = state => ({
  loggedIn: state.user.get('loggedIn')
});

export default withRouter(withStyles(styles)(connect(QueryDrawerState)(QueryDrawer)));
