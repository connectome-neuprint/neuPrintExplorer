/*
 * Top level page for displaying queries and results.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import history from '../history';


import Results from './Results';
import Home from './Home';
import Help from './Help';
import Favorites from './Favorites';
import TopBar from './TopBar';
import SideBar from './SideBar';
import Contact from './Contact';
import About from './About';
import QueryDrawer from './QueryDrawer';
import Errors from './Errors';


// adapted from material ui example
const styles = theme => ({
  root: {
    height: '100vh',
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  content: {
    height: '100vh',
    overflow: 'auto',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
});

const Master = (props) => {
  const { classes } = props;
  return (
    <Router history={history}>
      <div className={classes.root}>
        <TopBar />
        <SideBar />
        <QueryDrawer />
        <main className={classes.content} >
          <div className={classes.toolbar} />
          <Switch>
            <Route
              exact
              path="/"
              component={Home}
            />
            <Route
              path="/results"
              component={Results}
            />
            <Route
              path="/help"
              component={Help}
            />
            <Route
              path="/favorites"
              component={Favorites}
            />
            <Route
              path="/about"
              component={About}
            />
            <Route
              component={Home}
            />
          </Switch>
        </main>
        <Contact />
        <Errors />
      </div>
    </Router>
  );
}

Master.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Master);
