/*
 * Home page contains basic information for the page.
*/

"use strict";
import React from 'react';
import Typography from 'material-ui/Typography';
import { Redirect } from 'react-router-dom';

export class Home extends React.Component {
    render() {
        var redirectHome = false;
        if (window.location.pathname !== '/') {
            redirectHome = true;
        }
        return (
            <div>
                {redirectHome ? <Redirect to="/" /> : <div / >}
                <Typography variant="title">
                    Analysis tools for conenctomics
                </Typography>
                <Typography variant="body1">
                    ConnectomeAnalyzer provides tools to query and visualize connectomic data stored in a neo4j database.
                </Typography>
            </div>
        );
    }
}

