/*
 * Manages login to http service.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import C from '../reducers/constants';

const styles = theme => ({
  buttonBasic: {
    padding: `0 ${theme.spacing.unit}px`,
    minWidth: 1
  },
  buttonWrap: {
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)'
    }
  },
  buttonFont: theme.typography.button,
  icon: {
    padding: theme.spacing.unit,
    height: '4em',
    width: '4em',
    borderRadius: '500px'
  }
});

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userTarget: null,
      openUser: false,
      imageURL: ''
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
        this.setState({ isLoggedIn: true, imageURL: userInfo.ImageURL });
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
    this.setState({ isLoggedIn: false, imageURL: '' });
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
    const { classes } = this.props;
    const { isLoggedIn, userTarget, openUser, imageURL } = this.state;

    return (
      <div className={classes.buttonWrap}>
        {!isLoggedIn ? (
          <Button className={classes.buttonBasic} onClick={this.login}>
            LOGIN
          </Button>
        ) : (
          <div>
            <Button className={classes.buttonBasic} onClick={this.launchUserPopup}>
              <img alt="user avatar icon - click for menu" src={imageURL} className={classes.icon} />
            </Button>
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
              <MenuItem component='a' href="/token" >Auth Token</MenuItem>
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
  history: PropTypes.object.isRequired
};

export default withRouter(
  withStyles(styles)(
    connect(
      null,
      LoginDispatch
    )(Login)
  )
);
