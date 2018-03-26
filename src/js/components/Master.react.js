/*
 * Top level page for displaying queries and results.
*/

"use strict";
import React from 'react';
import { BrowserRouter, Route, browserHistory } from 'react-router-dom';
import Query from './Query.react';
import Results from './Results.react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Drawer from 'material-ui/Drawer';
import { withStyles } from 'material-ui/styles';
import NeoServer from './NeoServer.react';
import {Home} from './Home.react';
import List from 'material-ui/List';
import Icon from 'material-ui/Icon';
import classNames from 'classnames';
import { Link, Switch } from 'react-router-dom';
import Button from 'material-ui/Button';
import qs from 'qs';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { connect } from 'react-redux';
import Divider from 'material-ui/Divider';
import Favorites from './Favorites.react';
import Neo4jQuery from './Neo4jQuery.react';
import Popover from 'material-ui/Popover';

const drawerWidth = 400;

// adapted from material ui example
const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  flex: {
    flex: 1,
  },
  button: {
    background: "rgba(0, 0, 0, 0.12)"
  },
  buttonWrap: {
    '&:hover': {
          backgroundColor: "rgba(0, 0, 0, 0.12)"
      }
  },
  buttonBasic: {
    padding: 0,
  },
  drawerPaperQuery: {
    position: 'relative',
    width: drawerWidth,
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    alignItems: 'center',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
  itemsAlign: {
      alignItems: 'center',
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
  toolbar: theme.mixins.toolbar,
  icon: {
        padding: theme.spacing.unit,
        height: "4em",
        width: "4em",
        borderRadius: "500px"
  }
});

//const MyLink = props => <NavLink to="/results" {...props} />

class Master extends React.Component {
    constructor(props) {
        super(props);
        var querystr = this.props.urlQueryString;
        var query = qs.parse(querystr); 
        var openQuery = false;
        if ("openQuery" in query && query["openQuery"] === "true") {
            openQuery = true;
        } 

        this.state = {
            openQuery: openQuery,
            openUser: false,
            userTarget: null
        };
    }

    toggleQuery = () => {
        if (!this.state.openQuery) {
            var query = qs.parse(this.props.urlQueryString);
            query["openQuery"] = "true";
            var urlqs = qs.stringify(query);
            this.props.setURLQs(urlqs);
            history.replaceState(null, null, window.location.pathname + "?" + urlqs);
        } else {
            history.replaceState(null, null, window.location.pathname);
        }

        this.setState({openQuery: !this.state.openQuery});
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
            <div className={classes.root}>    
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
                        <Neo4jQuery />
                        <NeoServer />
                    </Toolbar>
                </AppBar>
                <BrowserRouter history={browserHistory}>
                    <div className={classes.root}>
                        <Drawer
                            variant="permanent"
                            classes={{
                                paper: classNames(classes.drawerPaper, classes.drawerPaperClose),
                            }}
                            open={false}
                        >
                            <div className={classes.toolbar} />
                            <div className={classes.itemsAlign}>
                                <Button className={(this.state.openQuery) ? classNames(classes.button) : ""}
                                        onClick={this.toggleQuery}
                                >
                                    <List><Icon>search</Icon></List>
                                </Button>
                                <Divider />
                                <Button component={Link}
                                        to={{pathname: "/", search: (this.state.openQuery ? this.props.urlQueryString : "")}}
                                >
                                    <List><Icon>home</Icon></List>
                                </Button>
                                <Button component={Link} 
                                        to={{pathname: "/results", search: (this.state.openQuery ? this.props.urlQueryString : "")}}
                                >
                                    <List><Icon>storages</Icon></List>
                                </Button>
                                {this.props.userInfo !== null ? 
                                    (<Button
                                                component={Link}
                                                to={{pathname: "/favorites", search: (this.state.openQuery ? this.props.urlQueryString : "")}}
                                     >
                                        <List><Icon>star</Icon></List>
                                    </Button>) :
                                    (<div />)
                                }
                            </div>
                        </Drawer>
                        {this.state.openQuery ? (
                                <div>
                                    <div className={classes.toolbar} / >
                                    <Drawer
                                        variant="permanent"
                                        classes={{
                                            paper: classes.drawerPaperQuery,
                                        }}
                                    >
                                        <Query />
                                    </Drawer>
                                </div>
                            ) : 
                            (<div />)}
            
                        <main className={classes.content} >
                            <div className={classes.toolbar} />
                                <Switch>
                                    <Route
                                        exact
                                        path="/"
                                        component={Home}
                                    />
                                    <Route
                                        path="/results"
                                        component={Results}
                                    />
                                    <Route
                                        path="/favorites"
                                        component={Favorites}
                                    />
                                    <Route
                                        component={Home}
                                    />
                                </Switch>
                        </main>
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}

var MasterState = function(state) {
    return {
        userInfo: state.userInfo,
        urlQueryString: state.urlQueryString,
    }
}

var MasterDispatch = function(dispatch) {
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
        setURLQs: function(querystring) {
            dispatch({
                type: 'SET_URL_QS',
                urlQueryString: querystring
            });
        }
    }
}

export default withStyles(styles)(connect(MasterState, MasterDispatch)(Master));
