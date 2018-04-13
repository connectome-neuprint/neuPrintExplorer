/*
 * Top level page for displaying queries and results.
*/

"use strict";
import React from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import NeoServer from './NeoServer.react';
import Button from 'material-ui/Button';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover';
import PropTypes from 'prop-types';

// adapted from material ui example
const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  flex: {
    flex: 1,
  },
  buttonWrap: {
    '&:hover': {
          backgroundColor: "rgba(0, 0, 0, 0.12)"
      }
  },
  buttonBasic: {
    padding: 0,
  },
  googleButton: {
      padding: "0 16px",
      fontSize: "0.875rem",
      color: "inherit",
      background: "inherit",
      boxSizing: "border-box",
      minWidth: "88px",
      borderWidth: "0",
      minHeight: "36px",
      borderRadius: "2px"
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  buttonFont: theme.typography.button,
  icon: {
        padding: theme.spacing.unit,
        height: "4em",
        width: "4em",
        borderRadius: "500px"
  }
});

class TopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            openUser: false, 
            userTarget: null 
        };
    }
    
    loginGoogle = (response) => {
        //document.write(JSON.stringify(response));
        //alert(JSON.stringify(response));
        this.props.loginUser(response);
    }

    logoutGoogle = () => {
        this.props.logoutUser();
    }

    launchUserPopup = (event) => {
        this.setState({openUser: true, userTarget: event.target});
    }

    closeUser = () => {
        this.setState({openUser: false, userTarget: null});
    }

    render() {
        const { classes } = this.props;
        
        return (
                <AppBar 
                        position="absolute" 
                        className={classes.appBar}
                >
                    <Toolbar>
                        <Typography 
                                    variant="title"
                                    color="inherit"
                                    className={classes.flex}
                                    noWrap
                        >
                            Connectome Analyzer    
                        </Typography>
                        <div className={classes.buttonWrap}>
                        {this.props.userInfo === null ?
                            (
                                <GoogleLogin
                                    className={classes.googleButton + " " + classes.buttonFont}
                                    clientId="274750196357-an9v0e8u0q0gmtt1ipv6riv18i77vatm.apps.googleusercontent.com"
                                    buttonText="Login"
                                    onSuccess={this.loginGoogle}
                                    onFailure={() => { alert("Login Failed")}}
                                    isSignedIn="true"
                                />
                            ) :
                            (
                                <div>
                                    <Button
                                            ref="userbutton"    
                                            className={classes.buttonBasic}
                                            onClick={this.launchUserPopup}>
                                        <img 
                                                src={this.props.userInfo.profileObj.imageUrl}
                                                className={classes.icon} 
                                        />
                                    </Button>
                                    <Popover
                                            open={this.state.openUser}
                                            anchorEl={this.state.userTarget}
                                            anchorReference="anchorEl"
                                            onClose={this.closeUser}
                                            anchorOrigin={{
                                                vertical: "bottom",
                                                horizontal: "center",
                                            }}
                                            transformOrigin={{
                                                vertical: "bottom",
                                                horizontal: "center",
                                            }}
                                    >
                                        <GoogleLogout
                                                       className={classes.googleButton + " " + classes.buttonFont}
                                                       clientId="274750196357-an9v0e8u0q0gmtt1ipv6riv18i77vatm.apps.googleusercontent.com"
                                                       buttonText="Logout"
                                                       onLogoutSuccess={this.logoutGoogle}
                                        />
                                    </Popover>

                                </div>
                            )
                        }
                        </div>
                        <NeoServer />
                    </Toolbar>
                </AppBar>
        );
    }
}

var TopBarState = function(state) {
    return {
        userInfo: state.user.userInfo,
    }
}

var TopBarDispatch = function(dispatch) {
    return {
        loginUser: function(info) {
            dispatch({
                type: 'LOGIN_USER',
                userInfo: info,
            });
        },
        logoutUser: function() {
            dispatch({
                type: 'LOGOUT_USER',
            });
        },
    }
}

TopBar.propTypes = {
    classes: PropTypes.object.isRequired,
    userInfo: PropTypes.object,
    logoutUser: PropTypes.func.isRequired,
    loginUser: PropTypes.func.isRequired,
};

export default withStyles(styles)(connect(TopBarState, TopBarDispatch)(TopBar));
