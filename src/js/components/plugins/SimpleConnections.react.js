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

const mainQuery = 'match (m:Neuron)-[e:ConnectsTo]->(n:Neuron) where m.name =~"ZZ" return m.name as NeuronPre, n.name as NeuronPost, e.weight as Weight order by m.name, e.weight desc';

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    padding: 5
  },
});

class SimpleConnections extends React.Component {
    static get queryName() {
        return "Simple Connections";
    }

    constructor(props) {
        super(props);
        this.state = {
            nameRestriction: ""
        };
    }

    static parseResults(neoResults) {
        // load one table from neoResults
        var tables = [];
        var maindata = [];
        var headerdata = [];

        neoResults.records.forEach(function (record) {
            var recorddata = [];
            record.forEach( function (value, key, rec) {
                var newval = neo4j.isInt(value) ?
                        (neo4j.integer.inSafeRange(value) ? 
                            value.toNumber() : value.toString()) 
                        : value;

                recorddata.push(newval);
            });
            maindata.push(recorddata);
        });
            
        if (neoResults.records.length > 0) {
            for(var i = 0; i< neoResults.records[0].length; i++) { 
                 headerdata.push(neoResults.records[0].keys[i]);
            }
        }
        
        tables.push({
            header: headerdata,
            body: maindata,
            name: "Find Connections"
        });
        
        return tables;
    }


    processRequest = (event) => {
        var query = mainQuery.replace("ZZ", this.state.nameRestriction)
        this.props.callback(query);
    }

    render() {
        const { classes } = this.props;
        return (<FormControl className={classes.formControl}>
                    <TextField 
                        label="Neuron name"
                        multiline
                        rows={1}
                        rowsMax={4}
                        className={classes.textField}
                        onChange={(event) => this.setState({nameRestriction: event.target.value})}
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


