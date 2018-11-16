/*
 * Side bar that contains navigation items and search window anchor. 
*/

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import qs from 'qs';
import { connect } from 'react-redux';

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';

import { setUrlQS } from '../actions/app';

const drawerWidth = 400;

// adapted from material ui example
const styles = theme => ({
  button: {
    background: 'rgba(0, 0, 0, 0.12)'
  },
  drawerPaper: {
    height: '100vh',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9
    }
  },
  toolbar: theme.mixins.toolbar
});

class SideBar extends React.Component {
  isOpen = () => {
    var query = qs.parse(this.props.urlQueryString);
    var openQuery = false;
    if ('openQuery' in query && query['openQuery'] === 'true') {
      openQuery = true;
    }
    return openQuery;
  };

  toggleQuery = () => {
    var openQuery = this.isOpen();
    var query = qs.parse(this.props.urlQueryString);

    if (!openQuery) {
      query['openQuery'] = 'true';
      let urlqs = qs.stringify(query);
      this.props.setURLQs(urlqs);

      window.history.replaceState(null, null, window.location.pathname + '?' + urlqs);
    } else {
      query['openQuery'] = 'false';
      let urlqs = qs.stringify(query);
      this.props.setURLQs(urlqs);

      window.history.replaceState(null, null, window.location.pathname);
    }
  };

  render() {
    const { classes, location } = this.props;
    var openQuery = this.isOpen();

    return (
      <Drawer
        variant="permanent"
        classes={{
          paper: classNames(classes.drawerPaper, classes.drawerPaperClose)
        }}
        open={false}
      >
        <div className={classes.toolbar} />
        <MenuList component="nav">
          <MenuItem button onClick={this.toggleQuery} selected={openQuery}>
            <ListItemIcon>
              <Icon>search</Icon>
            </ListItemIcon>
            <ListItemText primary="Search" />
          </MenuItem>

          <Divider />

          <MenuItem
            selected={/^\/$/.test(location.pathname)}
            component={NavLink}
            to={{ pathname: '/', search: openQuery ? this.props.urlQueryString : '' }}
            button
          >
            <ListItemIcon>
              <Icon>home</Icon>
            </ListItemIcon>
            <ListItemText primary="Home" />
          </MenuItem>

          <MenuItem
            selected={/^\/results/.test(location.pathname)}
            component={NavLink}
            to={{ pathname: '/results', search: openQuery ? this.props.urlQueryString : '' }}
            button
          >
            <ListItemIcon>
              <Icon>storages</Icon>
            </ListItemIcon>
            <ListItemText primary="Results" />
          </MenuItem>

          <MenuItem
            selected={/^\/favorites/.test(location.pathname)}
            component={NavLink}
            to={{ pathname: '/favorites', search: openQuery ? this.props.urlQueryString : '' }}
            button
          >
            <ListItemIcon>
              <Icon>star</Icon>
            </ListItemIcon>
            <ListItemText primary="Favorites" />
          </MenuItem>

          <MenuItem
            selected={/^\/help/.test(location.pathname)}
            component={NavLink}
            to={{ pathname: '/help', search: openQuery ? this.props.urlQueryString : '' }}
            button
          >
            <ListItemIcon>
              <Icon>info</Icon>
            </ListItemIcon>
            <ListItemText primary="Help" />
          </MenuItem>
        </MenuList>
      </Drawer>
    );
  }
}

var SideBarState = function(state) {
  return {
    userInfo: state.user.userInfo,
    urlQueryString: state.app.get('urlQueryString')
  };
};

var SideBarDispatch = function(dispatch) {
  return {
    setURLQs: function(querystring) {
      dispatch(setUrlQS(querystring));
    }
  };
};

SideBar.propTypes = {
  classes: PropTypes.object.isRequired,
  userInfo: PropTypes.object,
  location: PropTypes.object.isRequired,
  urlQueryString: PropTypes.string.isRequired,
  setURLQs: PropTypes.func.isRequired
};

export default withRouter(
  withStyles(styles)(
    connect(
      SideBarState,
      SideBarDispatch
    )(SideBar)
  )
);
