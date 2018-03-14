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


const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
    width: "80%"
  },
});

class FreeForm extends React.Component {
    static get name() {
        return "Custom";
    }

    constructor(props) {
        super(props);
        this.state = {
            textValue: ""
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
            name: "Custom Query"
        });
        
        return tables;
    }


    processRequest = (event) => {
        this.props.callback(this.state.textValue);
    }

    render() {
        const { classes } = this.props;
        return (<FormControl className={classes.formControl}>
                    <TextField 
                        label="Custom Cypher Query"
                        multiline
                        rows={1}
                        rowsMax={4}
                        className={classes.textField}
                        onChange={(event) => this.setState({textValue: event.target.value})}
                    />
                    {this.props.disable ?
                        (
                            <Button
                                variant="raised"
                                onClick={this.processRequest}
                                disabled
                            >
                                Submit
                            </Button>
                        ) :
                        (
                            <Button
                                variant="raised"
                                onClick={this.processRequest}
                            >
                                Submit
                            </Button>
                        )
                    }
                </FormControl>
        );
    }
}

export default withStyles(styles)(FreeForm);

FreeForm.propTypes = {
    callback: PropTypes.func,
    disable: PropTypes.bool
};


