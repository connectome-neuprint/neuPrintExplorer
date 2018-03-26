/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import { FormControl } from 'material-ui/Form';
import PropTypes from 'prop-types';
var neo4j = require('neo4j-driver').v1;
import { withStyles } from 'material-ui/styles';
import { LoadQueryString, SaveQueryString } from '../../qsparser';
import {connect} from 'react-redux';

const mainQuery = 'match (m:NeuronYY)-[e:ConnectsTo]->(n:NeuronYY) where ZZ return m.name as NeuronPre, n.name as NeuronPost, e.weight as Weight, m.bodyId as Body order by m.bodyId, e.weight desc';

const styles = theme => ({
  textField: {
  },
  formControl: {
  },
});

class SimpleConnections extends React.Component {
    static get queryName() {
        return "Simple Connections";
    }
    
    static get queryDescription() {
        return "List inputs or outputs to provided neuron(s)";
    }

    constructor(props) {
        super(props);
        var initqsParams = {
            neuronpre: "",
        }
        var qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams
        };
    }
    
    static parseResults(neoResults) {
        // load one table from neoResults
        var tables = [];
        var maindata = [];
        var headerdata = [];
        var currtable = [];
        var lastbody = -1;

        // grab headers
        if (neoResults.records.length > 0) {
            for(var i = 0; i< (neoResults.records[0].length-1); i++) { 
                 headerdata.push(neoResults.records[0].keys[i]);
            }
        }

        var currname = "";
        var lastname = "";
        // retrieve records
        neoResults.records.forEach(function (record) {
            var recorddata = [];
            record.forEach( function (value, key, rec) {
                var newval = neo4j.isInt(value) ?
                        (neo4j.integer.inSafeRange(value) ? 
                            value.toNumber() : value.toString()) 
                        : value;

                if (key === "Body") {
                    if ((lastbody !== -1) && (newval !== lastbody)) {
                        tables.push({
                            header: headerdata,
                            body: currtable,
                            name: "Connections from " + lastname + " id=(" + String(lastbody) + ")",
                        });
                        currtable = [];
                    } 
                    lastbody = newval; 
                } else {
                    if (key === "NeuronPre") {
                        lastname = currname;
                        currname = value;
                    }
                    recorddata.push(newval);
                }
            });
            currtable.push(recorddata);
        });
        
        if (lastbody !== -1) {
            tables.push({
                header: headerdata,
                body: currtable,
                name: "Connections from " + lastname + " id=(" + String(lastbody) + ")",
            });
        }

        return tables;
    }

    processRequest = (event) => {
        if (this.state.qsParams.neuronpre !== "") {
            var neoquery = ""; 
            if (isNaN(this.state.qsParams.neuronpre)) {
                neoquery = mainQuery.replace("ZZ", 'm.name =~"' + this.state.qsParams.neuronpre + '"');
            } else {
                neoquery = mainQuery.replace("ZZ", 'm.bodyId =' + this.state.qsParams.neuronpre);
            }
            
            neoquery = neoquery.replace(/YY/g, this.props.datasetstr)
            this.props.callback(neoquery);
        }
    }

    handleClick = (event) => {
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, {neuronpre: event.target.value}));
        this.setState({qsParams: {neuronpre: event.target.value}});
    }

    render() {
        const { classes } = this.props;
        return (<FormControl className={classes.formControl}>
                    <TextField 
                        label="Neuron name"
                        multiline
                        rows={1}
                        value={this.state.qsParams.neuronpre}
                        rowsMax={4}
                        className={classes.textField}
                        onChange={this.handleClick}
                    />
                    <Button
                        variant="raised"
                        onClick={this.processRequest}
                    >
                        Submit
                    </Button>
                </FormControl>
        );
    }
}

SimpleConnections.propTypes = {
    callback: PropTypes.func,
    disable: PropTypes.bool
};


var SimpleConnectionsState = function(state){
    return {
        urlQueryString: state.urlQueryString,
    }   
};

var SimpleConnectionsDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: 'SET_URL_QS',
                urlQueryString: querystring
            });
        }
    }
}


export default withStyles(styles)(connect(SimpleConnectionsState, SimpleConnectionsDispatch)(SimpleConnections));
