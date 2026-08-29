/*
 * Top level page for displaying queries and results.
 */

import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Route, Switch } from 'react-router-dom';
import withStyles from '@mui/styles/withStyles';
import history from '../history';

import TopBar from './TopBar';
import SideBar from './SideBar';
import QueryDrawer from './QueryDrawer';
import Errors from './Errors';
import Notification from './Notification';
import ErrorBoundary from './ErrorBoundary';
import AnnouncementBanner from './AnnouncementBanner';
import { NgViewerProvider } from '../contexts/NgViewerContext';
import C from '../reducers/constants';
import { acceptPendingTos } from '../helpers/datasetAccess';

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

// adapted from material ui example
const styles = theme => ({
  master: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  root: {
    flexGrow: 1,
    minHeight: 0,
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

const TOSPage = React.lazy(() => import('./TOSPage'));

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



function Master({ classes, user, setTosPending }) {
  const tosPending = user.get('tosPending');
  const acceptPendingTosCard = () =>
    acceptPendingTos(tosPending.dataset, history.location, () => setTosPending(null));

  // TODO: Have a router switch for logged in vs logged out users.
  // - loggedIn application has all the details and code we need for the full
  // site.
  // - loggedOut has basic help text and tutorial videos, but none of the heavy
  // lifting code.
  // eg: return user ? <AuthenticatedApp /> : <UnauthenticatedApp />
  return (
    <div className={classes.master}>
      <AnnouncementBanner />
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
                {tosPending ? (
                  <TOSPage
                    dataset={tosPending.dataset}
                    tosUrl={tosPending.tosUrl}
                    onAccept={acceptPendingTosCard}
                  />
                ) : (
                  <Switch>
                    <Route exact path="/" component={Home} />
                      <PrivateRoute user={user} path="/results" component={Results} />
                    <Route path="/help" component={Help} />
                    <PrivateRoute user={user} path="/favorites" component={Favorites} />
                    <Route path="/about" component={About} />
                    <PrivateRoute user={user} path="/account" component={Account} />
                    <Route path="/workstation" component={Workstation} />
                    <Route path="/view" component={Workstation} />
                    <Route component={NoMatch} />
                  </Switch>
                )}
              </Suspense>
              </NgViewerProvider>
            </main>
            <Errors />
            <Notification />
          </ErrorBoundary>
        </div>
      </Router>
    </div>
  );
};

Master.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  setTosPending: PropTypes.func.isRequired
};

const MasterState = state => ({
  user: state.user
});

const MasterDispatch = dispatch => ({
  setTosPending(tosPending) {
    dispatch({
      type: C.SET_TOS_PENDING,
      tosPending
    });
  }
});

export default withStyles(styles)(connect(MasterState, MasterDispatch)(Master));
