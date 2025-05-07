/*
 * Manages login to http service.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';
import { withCookies, Cookies } from 'react-cookie';
import classNames from 'classnames';

import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';

import C from '../reducers/constants';

import './Login.css';

const styles = theme => ({
  buttonBasic: {
    padding: `0 ${theme.spacing(1)}`,
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

    // only bother fetching these if there is a login cookie to pass along
    // with the request.
    if (props.cookies.get('flyem-services') || props.cookies.get('neuPrintHTTP') || process.env.NODE_ENV === 'development') {
      this.fetchProfile();
      this.fetchToken();
    }
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
              overlap="rectangular"
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
              <MenuItem component={NavLink} to={{ pathname: '/account' }} onClick={this.closeUser}>
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
  location: PropTypes.object.isRequired,
  cookies: PropTypes.instanceOf(Cookies).isRequired
};

const LoginState = state => ({
  userInfo: state.user.get('userInfo')
});

export default withRouter(
  withCookies(withStyles(styles)(connect(LoginState, LoginDispatch)(Login)))
);
