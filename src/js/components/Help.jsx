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
import HelpDetails from './Help/Videos';
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
  '/help/api': 1,
  '/help/videos': 2
};

function Help(props) {
  const { classes, location } = props;

  const value = locationValueMap[location.pathname];
  const queryString = location.search;

  return (
    <div className={classes.root}>
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
