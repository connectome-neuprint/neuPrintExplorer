/*
 * Manages login to http service.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import Cookies from 'js-cookie';

import C from '../reducers/constants';

import './Login.css';

const styles = theme => ({
  buttonBasic: {
    padding: `0 ${theme.spacing.unit}px`,
    minWidth: 1,
    color: '#fff'
  },
  buttonWrap: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)'
    }
  },
  buttonFont: theme.typography.button
});

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userTarget: null,
      openUser: false,
      useAvatarImg: true
    };

    this.fetchProfile();
    this.fetchToken();
  }

  fetchProfile = () => {
    const { loginUser, checkingUser, loginFailed } = this.props;
    checkingUser();
    fetch('/profile', {
      credentials: 'include'
    })
      .then(result => {
        if (!result.ok) {
          throw Error('failed to fetch login info');
        }
        return result.json();
      })
      .then(userInfo => {
        loginUser(userInfo);
        this.setState({ isLoggedIn: true });
      })
      .catch(() => {
        loginFailed();
      });
  };

  fetchToken = () => {
    const { setUserToken } = this.props;
    fetch('/token', {
      credentials: 'include'
    })
      .then(result => result.json())
      .then(data => {
        if (!('message' in data)) {
          setUserToken(data.token);
        }
      });
  };

  login = () => {
    const { location } = this.props;
    // redirect to current path to reduce friction when logging in.
    const redirectUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    window.open(`/login?redirect=${redirectUrl}`, '_self');
  };

  logout = () => {
    const { logoutUser } = this.props;
    this.setState({ isLoggedIn: false });
    // clear the login cookie(s) here.
    Cookies.remove('neuPrintHTTP');
    Cookies.remove('neuPrintHTTP', { path: '/', domain: '.janelia.org' });
    Cookies.remove('neuPrintHTTP', { path: '/', domain: window.location.hostname });
    Cookies.remove('flyem-services');
    Cookies.remove('flyem-services', { path: '/', domain: '.janelia.org' });
    Cookies.remove('flyem-services', { path: '/', domain: window.location.hostname });
    logoutUser();
    window.location = '/';
  };

  launchUserPopup = event => {
    this.setState({ openUser: true, userTarget: event.target });
  };

  closeUser = () => {
    this.setState({ openUser: false, userTarget: null });
  };

  render() {
    const { classes, userInfo } = this.props;
    const { isLoggedIn, userTarget, openUser, useAvatarImg } = this.state;

    const badgeVis = userInfo.AuthLevel !== 'admin';

    const avatar = useAvatarImg ? (
      <Avatar
        alt="Click for Menu"
        src={userInfo.ImageURL}
        onError={() => this.setState({ useAvatarImg: false })}
      />
    ) : (
      <Avatar className={classes.avatar}>{userInfo.Email.charAt(0).toUpperCase()}</Avatar>
    );

    return (
      <div className={classes.buttonWrap}>
        {!isLoggedIn ? (
          <Button
            variant="contained"
            color="primary"
            className={classNames(classes.buttonBasic, 'pulse')}
            onClick={this.login}
          >
            LOGIN
          </Button>
        ) : (
          <div>
            <Badge
              className={classes.adminIcon}
              invisible={badgeVis}
              badgeContent="A"
              color="secondary"
            >
              <Fab size="small" onClick={this.launchUserPopup} color="primary">
                {avatar}
              </Fab>
            </Badge>
            <Menu
              id="menu-appbar"
              anchorEl={userTarget}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={openUser}
              onClose={this.closeUser}
            >
              <MenuItem onClick={this.logout}>Logout</MenuItem>
              <MenuItem component={NavLink} to={{ pathname: '/account' }}>
                Account
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>
    );
  }
}

const LoginDispatch = dispatch => ({
  checkingUser() {
    dispatch({
      type: C.LOGIN_CHECK
    });
  },
  loginFailed() {
    dispatch({
      type: C.LOGIN_FAILED
    });
  },
  loginUser(info) {
    dispatch({
      type: C.LOGIN_USER,
      userInfo: info
    });
  },
  logoutUser() {
    dispatch({
      type: C.LOGOUT_USER
    });
  },
  setUserToken(token) {
    dispatch({
      type: C.SET_USER_TOKEN,
      token
    });
  }
});

Login.propTypes = {
  classes: PropTypes.object.isRequired,
  logoutUser: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired,
  loginFailed: PropTypes.func.isRequired,
  checkingUser: PropTypes.func.isRequired,
  setUserToken: PropTypes.func.isRequired,
  userInfo: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

const LoginState = state => ({
  userInfo: state.user.get('userInfo')
});

export default withRouter(
  withStyles(styles)(
    connect(
      LoginState,
      LoginDispatch
    )(Login)
  )
);
