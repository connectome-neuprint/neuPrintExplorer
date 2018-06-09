/*
 * Top level page for displaying queries and results.
*/

"use strict";
import React from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import { withStyles } from 'material-ui/styles';
import NeoServer from './NeoServer.react';
import Button from 'material-ui/Button';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';
import Popover from 'material-ui/Popover';
import PropTypes from 'prop-types';
import SvgIcon from 'material-ui/SvgIcon';

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
    padding: `0 ${theme.spacing.unit}px`,
    minWidth: 1,
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
  },
  img: {
    width: 120
  },
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
                        <div className={classes.flex}>
                            <img
                                src="/public/neuprintexplorerw.png"
                                className={classes.img}
                            />
                        </div>
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
                        <Button 
                                className={classes.buttonBasic}
                                onClick={() => location.href="https://github.com/janelia-flyem/neuPrintExplorer"}>
                        <SvgIcon nativeColor={"white"}>
                            <path d="M12.007 0C6.12 0 1.1 4.27.157 10.08c-.944 5.813 2.468 11.45 8.054 13.312.19.064.397.033.555-.084.16-.117.25-.304.244-.5v-2.042c-3.33.735-4.037-1.56-4.037-1.56-.22-.726-.694-1.35-1.334-1.756-1.096-.75.074-.735.074-.735.773.103 1.454.557 1.846 1.23.694 1.21 2.23 1.638 3.45.96.056-.61.327-1.178.766-1.605-2.67-.3-5.462-1.335-5.462-6.002-.02-1.193.42-2.35 1.23-3.226-.327-1.015-.27-2.116.166-3.09 0 0 1.006-.33 3.3 1.23 1.966-.538 4.04-.538 6.003 0 2.295-1.5 3.3-1.23 3.3-1.23.445 1.006.49 2.144.12 3.18.81.877 1.25 2.033 1.23 3.226 0 4.607-2.805 5.627-5.476 5.927.578.583.88 1.386.825 2.206v3.29c-.005.2.092.393.26.507.164.115.377.14.565.063 5.568-1.88 8.956-7.514 8.007-13.313C22.892 4.267 17.884.007 12.008 0z" />
                        </SvgIcon>
                        </Button>
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
