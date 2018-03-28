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
import Button from 'material-ui/Button';
import Modal from 'material-ui/Modal';

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
    img: {
        maxWidth: "100%",
        minWidth: "500px",
    },
    flex: {
        flex: 1,
        padding: '1em'
    },
    overflow: {
        overflow: "auto"
    }
});

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        }
    }
    
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }
   
    handleOpen = () => {
        this.setState({open: true});
    }

    handleClose = () => {
        this.setState({open: false});
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
                        ConnectomeAnalyzer provides tools to query and visualize connectomic data stored in a neo4j database.  More information on this tool and underlying data model can be found <a href="https://github.com/janelia-flyem/ConnectomeAnalyzer">here</a>.
                    </Typography>
                    <br />
                    <Typography>
                        The data is store in Neo4j, a graph database, and is accessible
                        through custom Cypher queries.  This app provides a series
                        of interfaces to simplify common access patterns.
                    </Typography>
                    <br />
                    <br />
                    <Typography variant="subheading">Graph Data Model (high-level)</Typography>
                    <br />
                    <Typography variant="body1">
                        The primary entry point into the graph model is the neuron 
                        node type.  Neurons (each which could be a subset or superset of an actual
                        neuron due to errors in automatic image segmentation) are connected
                        to other neurons via synapse connections.  To provide more granularity
                        into the connectomic dataset, these nodes point to a set of synapses
                        that give the exact locations of all synaptic connections for a given
                        neuron.  In a similar way, the morphology of the neuron is encoded
                        by a link to set of skeleton nodes with size and shape values.  Each
                        neuron and synapse is labeled with the given region(s) that they
                        belong to for fast region-based queries.  Finally, the probability
                        that two neurons should be merged (due to oversegmentation errors) 
                        is encoded by a relationship between nodes.
                    </Typography>
                    <br />
                    <Typography variant="body1">
                        Specific properties can be easily added to Neo4j as needed.  More
                        details of the graph model are shown in the accompanying illustration.
                    </Typography>
                </div>
                <div className={classes.flex}>
                    <Button onClick={this.handleOpen}>
                    <img
                        src="/public/overview.jpg"
                        className={classes.img}
                    />
                    </Button>
                    <Modal
                            aria-labelledby="Neo4j Graph Model"
                            aria-describedby="simple-modal-description"
                            open={this.state.open}
                            onClose={this.handleClose}
                    >
                        <div className={classes.overflow}>
                        <Button onClick={this.handleClose}>
                            <img src="/public/overview.jpg" />
                        </Button>
                        </div>
                    </Modal>
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
