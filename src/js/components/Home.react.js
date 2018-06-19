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
import { connect } from 'react-redux';
import Card from 'material-ui/Card';
import { CardContent } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import Grid from 'material-ui/Grid';
import { Link } from 'react-router-dom';
import SvgIcon from 'material-ui/SvgIcon';
import MobileStepper from 'material-ui/MobileStepper';
import Button from 'material-ui/Button';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';

const HintText = [
    (<Typography>Explore high-level region-to-region projectome-level connectivity as an entry point to analysis with the <a href="/?openQuery=true&Query%5BqueryType%5D=ROI%20Connectivity">ROI Connectivity</a> query.</Typography>),
    (<Typography>Find neurons using region-based filters with the <a href="/?openQuery=true&Query%5BqueryType%5D=Find%20Neurons">Find Neurons</a> query.</Typography>),
    (<Typography>Click the <Link to="/help">help</Link> icon for detailed information on how the connectome data is stored in the graph database.</Typography>),
];

const styles = theme => ({
    root: {
        flexGrow: 1,
        flexWrap: "wrap",
        display: 'flex',
        padding: theme.spacing.unit * 3,
    },
    roottext: {
        maxWidth: 560,
        margin: "0 auto"
    },
    card: {
        minWidth: 275,
        maxWidth: 500,
        marginLeft: "auto"
    },
    card2: {
        minWidth: 275,
        maxWidth: 500,
    },
    title: {
        marginBottom: 16,
        fontSize: 14,
    },
    divider: {
        margin: `${theme.spacing.unit}px 0` 
    },
    hint: {
        margin: `${theme.spacing.unit*2}px 0` 
    }
});

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {activeStep: 0};
    }
    
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }

    handleNext = () => {
        this.setState(prevState => ({
            activeStep: prevState.activeStep + 1,
        }));
    }

    handleBack = () => {
        this.setState(prevState => ({
            activeStep: prevState.activeStep - 1,
        }));
    }

    render() {
        const {classes, theme} = this.props;
        var redirectHome = false;
        if (window.location.pathname !== '/') {
            redirectHome = true;
        }
        return (
            <div className={classes.root}>
                {redirectHome ? <Redirect to="/" /> : <div / >}
                <Grid 
                        container 
                        spacing={24}
                >
                    <Grid 
                            item 
                            xs={12}
                    >
                        <div className={classes.roottext}>
                            <Typography variant="title">
                                Analysis tools for conenctomics
                            </Typography>
                            <br />
                            <Typography variant="body1">
                                neuPrintExplorer provides tools to query and visualize connectomic data stored in  <a href="https://github.com/janelia-flyem/neuPrint">neuPrint</a>, which uses a neo4j graph database.
                            </Typography>
                        </div>
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            sm={6}
                    >
                        <Card className={classes.card}>
                            <CardContent>
                              <Typography
                                            className={classes.title}
                                            color="textSecondary"
                              >
                               neuPrint Server Information 
                              </Typography>
                            <Divider className={classes.divider}/>
                              <Typography component="p">
                                server: {this.props.neoServer} <br />
                              </Typography>
                              <Typography component="p">
                                available datasets: 
                                        {this.props.availableDatasets.map( (item) => {
                                            return item + " "           
                                        })}
                                <br /> 
                              </Typography>
                              <Typography component="p">
                                last modified: {this.props.lastmod} <br /> 
                              </Typography>
                              <Typography component="p">
                                version: {this.props.version} <br /> 
                              </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid 
                            item 
                            xs={12}
                            sm={6}
                    >
                        <Card className={classes.card2}>
                            <CardContent>
                              <Typography
                                            className={classes.title}
                                            color="textSecondary"
                              >
                                Helpful Hints  
                              <SvgIcon nativeColor={"orange"}>
                                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                              </SvgIcon>
                              </Typography>
                              <Typography component="p">
                                Use the search icon
                                at the <a href="/?openQuery=true">top left</a> to query the database.
                              </Typography>
                                <Divider className={classes.divider}/>
            
                                <div className={classes.hint}>
                                {HintText[this.state.activeStep]}
                                </div>
                                <MobileStepper
                                          steps={HintText.length}
                                          position="static"
                                          activeStep={this.state.activeStep}
                                          nextButton={
                                            <Button 
                                                    size="small" 
                                                    onClick={this.handleNext}
                                                    disabled={this.state.activeStep === HintText.length - 1}
                                            >
                                              Next
                                              {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                                            </Button>
                                          }
                                          backButton={
                                            <Button 
                                                    size="small"
                                                    onClick={this.handleBack}
                                                    disabled={this.state.activeStep === 0}
                                            >
                                              {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                                              Back
                                            </Button>
                                          }
                            />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

var HomeState = function(state) {
    return {
        neoServer: state.neo4jsettings.neoServer,
        availableDatasets: state.neo4jsettings.availableDatasets,
        lastmod: state.neo4jsettings.lastmod,
        version: state.neo4jsettings.version,
    }
}

Home.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    classes: PropTypes.object,
    theme: PropTypes.object,
    availableDatasets: PropTypes.array.isRequired,
    neoServer: PropTypes.string.isRequired, 
    lastmod: PropTypes.string.isRequired, 
    version: PropTypes.string.isRequired, 
}

export default withStyles(styles, { withTheme: true })(connect(HomeState, null)(Home));
