/*
 * Top level page for displaying queries and results.
*/

"use strict";
import React from 'react';
import { HashRouter, Route, hashHistory } from 'react-router-dom';
import Query from './Query.react';
import Results from './Results.react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Drawer from 'material-ui/Drawer';
import { withStyles } from 'material-ui/styles';
import NeoServer from './NeoServer.react';

const drawerWidth = 400;

// adapted from material ui example
const styles = theme => ({
  root: {
    flexGrow: 1,
    height: 430,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minWidth: 0, // So the Typography noWrap works
  },
  toolbar: theme.mixins.toolbar,
});

class Master extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>    
                <AppBar position="absolute" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="title" color="inherit" noWrap>
                            Connectome Analyzer    
                        </Typography>
                        <NeoServer />
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <div className={classes.toolbar} />
                    <HashRouter history={hashHistory}>
                        <div>
                            <Route
                                exact
                                path="/"
                                component={Query}
                            />
                            <Route
                                path="/:queryType"
                                component={Query}
                            />
                        </div>
                    </HashRouter>
                </Drawer>
                <main className={classes.content} >
                    <div className={classes.toolbar} />
                    <Results />
                </main>
            </div>
        );
    }
}

export default withStyles(styles)(Master);
