/*
 * Top level page for displaying queries and results.
 */

import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import history from '../history';

import TopBar from './TopBar';
import SideBar from './SideBar';
import QueryDrawer from './QueryDrawer';
import Errors from './Errors';
import Notification from './Notification';

import './Master.css';

const Results = React.lazy(() => import('./Results'));
const Help = React.lazy(() => import('./Help'));
const About = React.lazy(() => import('./About'));
const Account = React.lazy(() => import('./Account'));
const Home = React.lazy(() => import('./Home'));
const Favorites = React.lazy(() => import('./Favorites'));
const NoMatch = React.lazy(() => import('./NoMatch'));
const Workstation = React.lazy(() => import('./Workstation'));

// adapted from material ui example
const styles = theme => ({
  root: {
    height: '100vh',
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex'
  },
  content: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.default,
    padding: 0,
    width: '100%',
    minWidth: 0 // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar
});

const Master = props => {
  const { classes } = props;
  return (
    <Router history={history}>
      <div className={classes.root}>
        <TopBar />
        <SideBar />
        <QueryDrawer />
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Suspense fallback={<div>loading...</div>}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/results" component={Results} />
              <Route path="/help" component={Help} />
              <Route path="/favorites" component={Favorites} />
              <Route path="/about" component={About} />
              <Route path="/account" component={Account} />
              <Route path="/workstation" component={Workstation} />
              <Route component={NoMatch} />
            </Switch>
          </Suspense>
        </main>
        <Errors />
        <Notification />
      </div>
    </Router>
  );
};

Master.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Master);
