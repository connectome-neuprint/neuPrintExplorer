/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
var neo4j = require('neo4j-driver').v1;
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormLabel, FormControl, FormControlLabel, FormHelperText } from 'material-ui/Form';
import { withStyles } from 'material-ui/styles';
import { LoadQueryString, SaveQueryString } from '../../qsparser';
import {connect} from 'react-redux';
import NeuronHelp from '../NeuronHelp.react';

const mainQuery = 'match (m:NeuronYY)XX(n:NeuronYY) where ZZ return m.name as Neuron1, n.name as Neuron2, n.bodyId as Neuron2Id, e.weight as Weight, m.bodyId as Neuron1Id order by m.name, m.bodyId, e.weight desc';

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

const styles = theme => ({
    textField: {
    },
    formControl: {
    },
    badge: {
        right: "-10px",
        width: "100px",
        height: "50px",
        top: "-10px",
    }
});

var PreOrPostHack = "pre";

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
            preorpost: "pre",
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
        var headerdata = ["Name", "Body ID", "Weight"];
        var currtable = [];
        var lastbody = -1;

        var currname = "";
        var lastname = "";
        // retrieve records
        neoResults.records.forEach(function (record) {
            var newval = convert64bit(record.get("Neuron1Id"));  
            if ((lastbody !== -1) && (newval !== lastbody)) {
                var tabname = lastname + " id=(" + String(lastbody) + ")";
                if (PreOrPostHack === "pre") {
                    tabname = tabname + " => ...";
                } else {
                    tabname = "... => " + tabname;
                }

                tables.push({
                    header: headerdata,
                    body: currtable,
                    name: tabname,
                });
                currtable = [];
            } 
            lastbody = newval; 
            lastname = record.get("Neuron1");

            currtable.push([
                record.get("Neuron2"), 
                convert64bit(record.get("Neuron2Id")), 
                convert64bit(record.get("Weight")) 
            ]);
        });

        if (lastbody !== -1) {
            var tabname = lastname + " id=(" + String(lastbody) + ")";
            if (PreOrPostHack === "pre") {
                tabname = tabname + " => ...";
            } else {
                tabname = "... => " + tabname;
            }
                
            tables.push({
                header: headerdata,
                body: currtable,
                name: tabname,
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
            if (this.state.qsParams.preorpost === "pre") {
                neoquery = neoquery.replace("XX", '-[e:ConnectsTo]->');
            } else {
                neoquery = neoquery.replace("XX", '<-[e:ConnectsTo]-');
            }
            
            PreOrPostHack = this.state.qsParams.preorpost;
            this.props.callback(neoquery);
        }
    }

    handleClick = (event) => {
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, {neuronpre: event.target.value}));
        this.setState({qsParams: {neuronpre: event.target.value}});
    }

    setDirection = (event) => {
        var oldparams = this.state.qsParams;
        oldparams.preorpost = event.target.value;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldparams));
        this.setState({qsParams: oldparams});
    }

    render() {
        const { classes } = this.props;
        return (<div>
                    <FormControl className={classes.formControl}>
                    <NeuronHelp>
                        <TextField 
                            label="Neuron name"
                            multiline
                            rows={1}
                            value={this.state.qsParams.neuronpre}
                            rowsMax={4}
                            className={classes.textField}
                            onChange={this.handleClick}
                        />
                    </NeuronHelp>
                    </FormControl>
                    <FormControl component="fieldset" required className={classes.formControl}>
                        <FormLabel component="legend">Neuron Direction</FormLabel>
                        <RadioGroup
                                    aria-label="preorpost"
                                    name="preorpost"
                                    className={classes.group}
                                    value={this.state.qsParams.preorpost}
                                    onChange={this.setDirection}
                        >
                            <FormControlLabel value="pre" control={<Radio />} label="Pre-synaptic" />
                            <FormControlLabel value="post" control={<Radio />} label="Post-synaptic" />
                        </RadioGroup>
                    </FormControl> 
                    <Button
                        variant="raised"
                        onClick={this.processRequest}
                    >
                        Submit
                    </Button>
            </div>
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
