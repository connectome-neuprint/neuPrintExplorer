/*
 * Side bar that contains navigation items and search window anchor.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
import Divider from '@material-ui/core/Divider';

import Contact from './Contact';
import { getSiteParams, setQueryString } from '../helpers/queryString';

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
    width: theme.spacing.unit * 7
  },
  toolbar: theme.mixins.toolbar
});

class SideBar extends React.Component {
  toggleQuery = () => {
    const { location } = this.props;
    const qsParams = getSiteParams(location);

    const openQuery = qsParams.get('q');
    if (!openQuery) {
      setQueryString({ q: 1 });
    } else {
      setQueryString({ q: undefined });
    }
  };

  render() {
    const { classes, location } = this.props;

    const qsParams = getSiteParams(location);

    if (qsParams.get('rt') === 'full') {
      return '';
    }

    const openQuery = Boolean(qsParams.get('q'));
    const queryString = location.search;

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
            to={{ pathname: '/', search: queryString }}
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
            to={{ pathname: '/results', search: queryString }}
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
            to={{ pathname: '/favorites', search: queryString }}
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
            to={{ pathname: '/help', search: queryString }}
            button
          >
            <ListItemIcon>
              <Icon>info</Icon>
            </ListItemIcon>
            <ListItemText primary="Help" />
          </MenuItem>
        </MenuList>
        <Contact />
      </Drawer>
    );
  }
}

SideBar.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(withStyles(styles)(SideBar));
