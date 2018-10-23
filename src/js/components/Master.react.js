/*
 * Top level page for displaying queries and results.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';

import Results from './Results.react';
import Home from './Home.react';
import Help from './Help.react';
import Favorites from './Favorites.react';
import Neo4jQuery from './Neo4jQuery.react';
import TopBar from './TopBar.react';
import SideBar from './SideBar.react';
import Contact from './Contact';
import About from './About';
import QueryDrawer from './QueryDrawer.react';
import createBrowserHistory from 'history/createBrowserHistory';


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

//const MyLink = props => <NavLink to="/results" {...props} />

class Master extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <Router history={createBrowserHistory()}>
        <div className={classes.root}>
          <Neo4jQuery />
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
        </div>
      </Router>
    );
  }
}

Master.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Master);
