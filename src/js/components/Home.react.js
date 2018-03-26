/*
 * Home page contains basic information for the page.
*/

"use strict";
import React from 'react';
import Typography from 'material-ui/Typography';
import { Redirect } from 'react-router-dom';
import _ from "underscore";
import PropTypes from 'prop-types';

export class Home extends React.Component {
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }
    
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
                    ConnectomeAnalyzer provides tools to query and visualize connectomic data stored in a neo4j database.  More information on this tool and underlying data model can be found <a href="https://github.com/janelia-flyem/ConnectomeAnalyzer">here</a>.
                </Typography>
            </div>
        );
    }
}

Home.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    })
}
