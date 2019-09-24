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
  buttonFont: theme.typography.button,
});

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userTarget: null,
      openUser: false,
    };

    this.fetchProfile();
    this.fetchToken();
  }

  fetchProfile = () => {
    const { loginUser } = this.props;
    fetch('/profile', {
      credentials: 'include'
    })
      .then(result => result.json())
      .then(userInfo => {
        loginUser(userInfo);
        this.setState({ isLoggedIn: true });
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
    // TODO: redirect to current path
    window.open('/login?redirect=/', '_self');
  };

  logout = () => {
    const { logoutUser } = this.props;
    const { history } = this.props;
    this.setState({ isLoggedIn: false });
    logoutUser();
    fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    });
    history.push('/');
  };

  launchUserPopup = event => {
    this.setState({ openUser: true, userTarget: event.target });
  };

  closeUser = () => {
    this.setState({ openUser: false, userTarget: null });
  };

  render() {
    const { classes, userInfo } = this.props;
    const { isLoggedIn, userTarget, openUser } = this.state;

    const badgeVis = userInfo.AuthLevel !== 'admin'

    return (
      <div className={classes.buttonWrap}>
        {!isLoggedIn ? (
          <Button className={classNames(classes.buttonBasic, 'pulse')} onClick={this.login}>
            LOGIN
          </Button>
        ) : (
          <div>
            <Badge className={classes.adminIcon} invisible={badgeVis} badgeContent="A" color="secondary">
              <Fab size="small" onClick={this.launchUserPopup}>
                <Avatar alt="Click for Menu" src={userInfo.ImageURL} />
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
              <MenuItem
                component={NavLink}
                to={{ pathname: '/account'}}
              >Account</MenuItem>
            </Menu>
          </div>
        )}
      </div>
    );
  }
}

const LoginDispatch = dispatch => ({
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
  setUserToken: PropTypes.func.isRequired,
  userInfo: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const LoginState = (state) => ({
  userInfo: state.user.get('userInfo'),
});

export default withRouter(
  withStyles(styles)(
    connect(
      LoginState,
      LoginDispatch
    )(Login)
  )
);
