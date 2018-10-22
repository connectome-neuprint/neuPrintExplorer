/*
 * Manages login to http service.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import { withRouter } from 'react-router-dom';

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
    fetch('/profile', {
      credentials: 'include'
    })
      .then(result => result.json())
      .then(userInfo => {
        this.props.loginUser(userInfo);
        this.setState({ isLoggedIn: true, imageURL: userInfo.ImageURL });
      });
  };

  fetchToken = () => {
    fetch('/token', {
      credentials: 'include'
    })
      .then(result => result.json())
      .then(data => {
        if (!('message' in data)) {
          this.props.setUserToken(data.token);
        }
      });
  };

  login = () => {
    // TODO: redirect to current path
    window.open('/login?redirect=/', '_self');
  };

  logout = () => {
    const { history } = this.props;
    this.setState({ isLoggedIn: false, imageURL: '' });
    this.props.logoutUser();
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

    return (
      <div className={classes.buttonWrap}>
        {!this.state.isLoggedIn ? (
          <Button className={classes.buttonBasic} onClick={this.login}>
            LOGIN
          </Button>
        ) : (
          <div>
            <Button ref="userbutton" className={classes.buttonBasic} onClick={this.launchUserPopup}>
              <img src={this.state.imageURL} className={classes.icon} />
            </Button>
            <Popover
              open={this.state.openUser}
              anchorEl={this.state.userTarget}
              anchorReference="anchorEl"
              onClose={this.closeUser}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
            >
              <Button className={classes.buttonBasic} onClick={this.logout}>
                LOGOUT
              </Button>
            </Popover>
          </div>
        )}
      </div>
    );
  }
}

var LoginDispatch = function(dispatch) {
  return {
    loginUser: function(info) {
      dispatch({
        type: C.LOGIN_USER,
        userInfo: info
      });
    },
    logoutUser: function() {
      dispatch({
        type: C.LOGOUT_USER
      });
    },
    setUserToken: function(token) {
      dispatch({
        type: C.SET_USER_TOKEN,
        token: token
      });
    }
  };
};

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
