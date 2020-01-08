/*
 * Help page provides documentation.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import { Switch, Route, Link } from 'react-router-dom';
import HelpMain from './Help/HelpMain';
import HelpBasic from './Help/Basic';
import HelpBatch from './Help/Batch';
import HelpDetails from './Help/Details';
import HelpApi from './Help/Api';

const styles = theme => ({
  root: {
    overflow: 'scroll',
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: theme.spacing.unit * 3
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
  bold: { fontWeight: 'bold', display: 'inline' }
});

const locationValueMap = {
  '/help': 0,
  '/help/basic': 1,
  '/help/batch': 2,
  '/help/api': 3,
  '/help/details': 4
};

function Help(props) {
    const { classes, location } = props;

    const value = locationValueMap[location.pathname];
    const queryString = location.search;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs value={value} >
            <Tab label="Overview" component={Link} to={{ pathname: '/help', search: queryString }} />
            <Tab label="Basic Analysis" component={Link} to={{ pathname: '/help/basic', search: queryString }} />
            <Tab label="Batch Analysis" component={Link} to={{ pathname: '/help/batch', search: queryString }} />
            <Tab label="Programmer's Interface" component={Link} to={{ pathname: '/help/api', search: queryString }} />
            <Tab label="Technical Details" component={Link} to={{ pathname: '/help/details', search: queryString }} />
          </Tabs>
        </AppBar>

        <Switch>
          <Route exact path="/help">
            <HelpMain />
          </Route>
          <Route path="/help/basic">
            <HelpBasic />
          </Route>
          <Route path="/help/batch">
            <HelpBatch />
          </Route>
          <Route path="/help/api">
            <HelpApi />
          </Route>
          <Route path="/help/details">
            <HelpDetails />
          </Route>
        </Switch>
      </div>
    );
}

Help.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Help);
