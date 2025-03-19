/*
 * Top level page for displaying queries and results.
 */

import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import history from '../history';

import TopBar from './TopBar';
import SideBar from './SideBar';
import QueryDrawer from './QueryDrawer';
import Errors from './Errors';
import Notification from './Notification';
import ErrorBoundary from './ErrorBoundary';
import { NgViewerProvider } from '../contexts/NgViewerContext';

import './Master.css';

const Results = React.lazy(() => import('./Results'));
const Help = React.lazy(() => import('./Help'));
const About = React.lazy(() => import('./About'));
const Account = React.lazy(() => import('./Account'));
const Home = React.lazy(() => import('./Home'));
const Favorites = React.lazy(() => import('./Favorites'));
const NoMatch = React.lazy(() => import('./NoMatch'));
const Workstation = React.lazy(() => import('../containers/Workstation'));
const Login = React.lazy(() => import('./LoginPage'));
const ReleaseNotes = React.lazy(() => import('./ReleaseNotes'));

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

function PrivateRoute({ component: Component, user, ...rest }) {
  if (!user.get('loggedIn')) {
    if (user.get('loaded')) {
      // have to encode the uri here to make sure the &'s are escaped. If they aren't
      // they wont make it through the redirect code.
      const redirectUrl = encodeURIComponent(`${rest.location.pathname}${rest.location.search}`);
      window.open(`/login?redirect=${redirectUrl}`, '_self');
    }
  }

  return (
    <Route
      {...rest}
      render={privateProps =>
        user.get('loggedIn', false) ? <Component {...privateProps} /> : <Login {...privateProps} />
      }
    />
  );
};

PrivateRoute.propTypes = {
  component: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};



function Master({ classes, user }) {

  // TODO: Have a router switch for logged in vs logged out users.
  // - loggedIn application has all the details and code we need for the full
  // site.
  // - loggedOut has basic help text and tutorial videos, but none of the heavy
  // lifting code.
  // eg: return user ? <AuthenticatedApp /> : <UnauthenticatedApp />
  return (
    <Router history={history}>
      <div className={classes.root}>
        <ErrorBoundary>
          <TopBar />
          <SideBar />
          <QueryDrawer />
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <NgViewerProvider>
            <Suspense fallback={<div>loading...</div>}>
              <Switch>
                <Route exact path="/" component={Home} />
                  <PrivateRoute user={user} path="/results" component={Results} />
                <Route path="/help" component={Help} />
                <PrivateRoute user={user} path="/favorites" component={Favorites} />
                <Route path="/about" component={About} />
                <PrivateRoute user={user} path="/account" component={Account} />
                <Route path="/workstation" component={Workstation} />
                <Route path="/view" component={Workstation} />
                <Route path="/releasenotes" component={ReleaseNotes} />
                <Route component={NoMatch} />
              </Switch>
            </Suspense>
            </NgViewerProvider>
          </main>
          <Errors />
          <Notification />
        </ErrorBoundary>
      </div>
    </Router>
  );
};

Master.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

const MasterState = state => ({
  user: state.user
});

export default withStyles(styles)(connect(MasterState)(Master));
