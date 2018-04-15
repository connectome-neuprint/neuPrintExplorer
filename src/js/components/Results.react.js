/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';
import Fade from 'material-ui/transitions/Fade';
import { CircularProgress } from 'material-ui/Progress';
import { connect } from 'react-redux';
import SimpleTables from './SimpleTables.react';
import { withStyles } from 'material-ui/styles';
import _ from "underscore";
import PropTypes from 'prop-types';
import ResultsTopBar from './ResultsTopBar.react';

const styles = () => ({
    root: {
        flexGrow: 1,
    },
    flex: {
        flex: 1,
    }
});

class Results extends React.Component {
    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }

    downloadFile = (index) => {
        var csvdata = "";
        this.props.allTables[index].map( (tableinfo) => {
            // load one table -- fixed width
            
            // load table name
            var numelements = tableinfo.header.length;
            csvdata = csvdata + tableinfo.name + ",";
            for (var i = 1; i < numelements; i++) {
                csvdata = csvdata + ",";
            }
            csvdata = csvdata + "\n";

            // load headers
            tableinfo.header.map( (headinfo) => {
                csvdata = csvdata + headinfo + ",";
            });
            csvdata = csvdata + "\n";

            // load data
            tableinfo.body.map( (rowinfo) => {
                rowinfo.map( (elinfo) => {
                    csvdata = csvdata + JSON.stringify(elinfo) + ",";
                });
                csvdata = csvdata + "\n";
            });
        });

        var element = document.createElement("a");
        var file = new Blob([csvdata], {type: 'text/csv'});
        element.href = URL.createObjectURL(file);
        element.download = "results.csv";
        element.click();
    }

    render() {
        // TODO: show query runtime results
        const { classes } = this.props; 

        return (
            <div>
                { (this.props.userInfo !== null && this.props.allTables !== null) ? (
                    <div />    
                ) : (
                    <Typography variant="title">No Query Results</Typography>
                  )
                }
                <Fade
                    in={this.props.isQuerying}
                    style={{
                        transitionDelay: this.props.isQuerying ? '800ms' : '0ms',
                    }}
                    unmountOnExit
                >
                    <CircularProgress />
                </Fade>
                { (this.props.neoError !== null) ? 
                    (<Typography>Error: {this.props.neoError.code}</Typography>) :
                    (this.props.allTables !== null ?
                        (
                            <div className={classes.root}>
                                {this.props.allTables.map( (result, index) => {
                                    return (
                                        <div className={classes.flex} 
                                                key={String(index)}
                                        >
                                            <ResultsTopBar
                                                            downloadCallback={this.downloadFile}
                                                            name={(result.length == 1) ? 
                                                                    result[0].name :
                                                                    String(result.length) + " tables"
                                                            } 
                                                            queryStr={result[0].queryStr}
                                                            index={index}
                                            />
                                            <SimpleTables 
                                                            allTables={result}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        ) : 
                        (<div />)
                    )
                }
            </div>
        );
    }
}

Results.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    allTables: PropTypes.array,
    queryObj: PropTypes.object.isRequired, 
    neoError: PropTypes.object,
    isQuerying: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
    userInfo: PropTypes.object,
};

// result data [{name: "table name", header: [headers...], body: [rows...]
var ResultsState = function(state){
    return {
        isQuerying: state.query.isQuerying,
        neoError: state.query.neoError,
        allTables: state.results.allTables,
        userInfo: state.user.userInfo,
        queryObj: state.query.neoQueryObj,
    }   
};

export default withStyles(styles)(connect(ResultsState, null)(Results));
