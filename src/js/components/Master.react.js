/*
 * Top level page for displaying queries and results.
*/

"use strict";
import React from 'react';
import { HashRouter, Route, hashHistory } from 'react-router-dom';
import Query from './Query.react';
import Results from './Results.react';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';

export default class Master extends React.Component {
    render() {
        return (
            <div>    
                <Toolbar>
                    <Typography variant="title" color="inherit">
                        Connectome Analyzer    
                    </Typography>
                </Toolbar>
                <div style={{padding: 20}}>    
                <Grid container spacing={24}>
                    <Grid item xs={12}>
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
                        <Results />
                    </Grid>
                </Grid>
                </div>
            </div>
        );
    }
}

