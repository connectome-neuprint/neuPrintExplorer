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
import qs from 'qs';

const mainQuery = 'match (m:Neuron)-[e:ConnectsTo]->(n:Neuron) where m.name =~"ZZ" return m.name as NeuronPre, n.name as NeuronPost, e.weight as Weight, m.bodyId as Body order by m.bodyId, e.weight desc';

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

    constructor(props) {
        super(props);
        
        var neuronpre = "";
        var query = qs.parse(window.location.search.substring(1));
        if (("Query:" + this.constructor.queryName) in query) {
            var currentparams = query["Query:" + this.constructor.queryName];
            neuronpre = currentparams.neuronpre;
        }
            
        this.state = {
            neuronpre: neuronpre
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
        var querystr= qs.parse(window.location.search.substring(1));
        querystr["Query:" + this.constructor.queryName] = { neuronpre: this.state.neuronpre };
        history.replaceState(null, null, window.location.pathname + "?" + qs.stringify(querystr));
        var neoquery = mainQuery.replace("ZZ", this.state.neuronpre)
        this.props.callback(neoquery);
    }

    render() {
        const { classes } = this.props;
        return (<FormControl className={classes.formControl}>
                    <TextField 
                        label="Neuron name"
                        multiline
                        rows={1}
                        value={this.state.neuronpre}
                        rowsMax={4}
                        className={classes.textField}
                        onChange={(event) => this.setState({neuronpre: event.target.value})}
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

export default withStyles(styles)(SimpleConnections);

SimpleConnections.propTypes = {
    callback: PropTypes.func,
    disable: PropTypes.bool
};


