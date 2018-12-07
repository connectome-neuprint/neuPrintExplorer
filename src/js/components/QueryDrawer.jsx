/*
 * Side drawer pop out for queries. 
*/

import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import qs from 'qs';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Query from './Query';

const drawerWidth = 400;

// adapted from material ui example
const styles = theme => ({
  drawerPaperQuery: {
    minHeight: '100vh',
    position: 'relative',
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar
});

// const MyLink = props => <NavLink to="/results" {...props} />

const QueryDrawer = (props) => {
  const { classes, urlQueryString } = props;
  const query = qs.parse(urlQueryString);
  let openQuery = false;
  if ('openQuery' in query && query.openQuery === 'true') {
    openQuery = true;
  }

  if (openQuery) {
    return (
      <div>
        <Drawer
          variant="permanent"
          classes={{
            paper: classes.drawerPaperQuery
          }}
        >
          <div className={classes.toolbar} />
          <Query />
        </Drawer>
      </div>
    );
  }
  return null;
}

const QueryDrawerState = state => ({
  urlQueryString: state.app.get('urlQueryString')
});

QueryDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  urlQueryString: PropTypes.string.isRequired
};

export default withStyles(styles)(
  connect(
    QueryDrawerState,
    null
  )(QueryDrawer)
);
