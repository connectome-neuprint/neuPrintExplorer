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
import { Redirect, NavLink, Link, Switch } from 'react-router-dom';
import Button from 'material-ui/Button';
import qs from 'qs';

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
    background: "gray"
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
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
});

//const MyLink = props => <NavLink to="/results" {...props} />

class Master extends React.Component {
    constructor(props) {
        super(props);
        var query = qs.parse(window.location.search.substring(1));
        var openQuery = false;
        if ("openQuery" in query && query["openQuery"] === "true") {
            openQuery = true;
        }

        this.state = {
            openQuery: openQuery
        };
    }

    toggleQuery = () => {
        var query = qs.parse(window.location.search.substring(1));
        if (this.state.openQuery) {
            query["openQuery"] = "false";     
        } else {
            query["openQuery"] = "true";     
        }

        history.replaceState(null, null, window.location.pathname + "?" + qs.stringify(query));
        this.setState({openQuery: !this.state.openQuery});
    }

    render() {
       // alert(JSON.stringify(qs.parse(window.location.search)));

        const { classes } = this.props;
        return (
            <div className={classes.root}>    
                <AppBar position="absolute" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="title" color="inherit" className={classes.flex} noWrap>
                            Connectome Analyzer    
                        </Typography>
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
                                <Button component={Link} to="/"><List><Icon>home</Icon></List></Button>
                                <Button component={Link} to="/results"><List><Icon>storages</Icon></List></Button>
                                <Button className={(this.state.openQuery) ? classNames(classes.button) : ""}
                                        onClick={this.toggleQuery}
                                >
                                    <List><Icon>search</Icon></List>
                                </Button> 
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

export default withStyles(styles)(Master);
