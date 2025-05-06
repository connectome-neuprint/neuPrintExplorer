/*
 * Side bar that contains navigation items and search window anchor.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';

import Drawer from '@mui/material/Drawer';
import withStyles from '@mui/styles/withStyles';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Icon from '@mui/material/Icon';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';

import Contact from './Contact';
import { getSiteParams, setQueryString } from '../helpers/queryString';

const drawerWidth = 200;

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
    height: '100vh',
    position: 'relative',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(6)
  },
  toolbar: theme.mixins.toolbar
});

function lsTest() {
  const test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function SideBar({ classes, location }) {
  const [open, setOpen] = useState(() => {
    // getting stored value
    if (lsTest()) {
      const saved = localStorage.getItem('collapse_menu');
      const initialValue = JSON.parse(saved);
      return initialValue || false;
    }
    return false;
  });

  const qsParams = getSiteParams(location);
  if (qsParams.get('rt') === 'full') {
    return '';
  }

  const toggleClosed = () => {
    if (lsTest()) {
      localStorage.setItem('collapse_menu', JSON.stringify(!open));
    }
    setOpen(!open);
  };

  const openQuery = Boolean(qsParams.get('q'));
  const queryString = location.search;

  const toggleQuery = () => {
    if (!openQuery) {
      setQueryString({ q: 1 });
    } else {
      setQueryString({ q: undefined });
    }
  };

  const drawerClass = open ? classes.drawerPaper : classes.drawerPaperClose;

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classNames(drawerClass)
      }}
      open={open}
    >
      <div className={classes.toolbar} />
      <MenuList component="nav">
        <MenuItem button onClick={toggleClosed}>
          <Tooltip title={open ? "Collapse Menu" : "Expand Menu"} aria-label={open ? "Collapse Menu" : "Expand Menu"} placement="top-end">
            <ListItemIcon>{open ? <ChevronLeftIcon /> : <ChevronRightIcon />}</ListItemIcon>
          </Tooltip>
        </MenuItem>

        <MenuItem button onClick={toggleQuery} selected={openQuery}>
          <Tooltip title="Search Input" aria-label="Search Input" placement="top-end">
            <ListItemIcon>
              <Icon>search</Icon>
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Search" />
        </MenuItem>

        <Divider />

        <MenuItem
          selected={/^\/$/.test(location.pathname)}
          component={NavLink}
          to={{ pathname: '/', search: queryString }}
          button
        >
          <Tooltip title="Home" aria-label="Home" placement="top-end">
            <ListItemIcon>
              <Icon>home</Icon>
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Home" />
        </MenuItem>

        <MenuItem
          selected={/^\/results/.test(location.pathname)}
          component={NavLink}
          to={{ pathname: '/results', search: queryString }}
          button
        >
          <Tooltip title="Search Results" aria-label="Search Results" placement="top-end">
            <ListItemIcon>
              <Icon>storages</Icon>
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Results" />
        </MenuItem>

        <MenuItem
          selected={/^\/favorites/.test(location.pathname)}
          component={NavLink}
          to={{ pathname: '/favorites', search: queryString }}
          button
        >
          <Tooltip title="Favorites" aria-label="Favorites" placement="top-end">
            <ListItemIcon>
              <Icon>star</Icon>
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Favorites" />
        </MenuItem>

        <MenuItem
          selected={/^\/help/.test(location.pathname)}
          component={NavLink}
          to={{ pathname: '/help', search: queryString }}
          button
        >
          <Tooltip title="Help" aria-label="Help" placement="top-end">
            <ListItemIcon>
              <Icon>info</Icon>
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Help" />
        </MenuItem>

        <MenuItem
          selected={/^\/releasenotes/.test(location.pathname)}
          component={NavLink}
          to={{ pathname: '/releasenotes', search: queryString }}
          button
        >
          <Tooltip title="Release Notes" aria-label="Release Notes" placement="top-end">
            <ListItemIcon>
              <Icon>list</Icon>
            </ListItemIcon>
          </Tooltip>
          <ListItemText primary="Release Notes" />
        </MenuItem>
      </MenuList>
      <Contact />
    </Drawer>
  );
}

SideBar.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default withRouter(withStyles(styles)(SideBar));
