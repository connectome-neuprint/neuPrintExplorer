/*
 * Home page contains basic information for the page.
*/

"use strict";
import React from 'react';
import Typography from 'material-ui/Typography';
import { Redirect } from 'react-router-dom';
import _ from "underscore";
import PropTypes from 'prop-types';
import {withStyles} from 'material-ui/styles';

const styles = () => ({
    root: {
        flexGrow: 1,
        flexWrap: "wrap",
        display: 'flex',
    },
    roottext: {
        maxWidth: 500,
        flex: 1,
    },
});

class Home extends React.Component {
    constructor(props) {
        super(props);
    }
    
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }
   
    render() {
        const {classes} = this.props;
        var redirectHome = false;
        if (window.location.pathname !== '/') {
            redirectHome = true;
        }
        return (
            <div className={classes.root}>
                {redirectHome ? <Redirect to="/" /> : <div / >}
                <div className={classes.roottext}>
                    <Typography variant="title">
                        Analysis tools for conenctomics
                    </Typography>
                    <br />
                    <Typography variant="body1">
                        neuPrintExplorer provides tools to query and visualize connectomic data stored in  <a href="https://github.com/janelia-flyem/neuPrint">neuPrint</a>, which uses a neo4j graph database.
                    </Typography>
                </div>
            </div>
        );
    }
}

Home.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    classes: PropTypes.object,
}

export default withStyles(styles)(Home);
