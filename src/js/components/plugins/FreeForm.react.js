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
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import {connect} from 'react-redux';


const styles = () => ({
  textField: {
    width: 300
  },
  formControl: {
  },
});

class FreeForm extends React.Component {
    static get queryName() {
        return "Custom";
    }
    
    static get queryDescription() {
        return "Enter custom Neo4j Cypher query";
    }
  
    static parseResults(neoResults) {
        // load one table from neoResults
        var tables = [];
        var maindata = [];
        var headerdata = [];

        neoResults.records.forEach(function (record) {
            var recorddata = [];
            record.forEach( function (value) {
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

    constructor(props) {
        super(props);
        var initqsParams = {
            textValue: "",
        }
        var qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams
        };
    }
  
    processRequest = () => {
        let query = {
            queryStr: this.state.qsParams.textValue,
            callback: FreeForm.parseResults,    
            state: {},
        }
        
        this.props.callback(query);
    }

    handleClick = (event) => {
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, {textValue: event.target.value}));
        this.setState({qsParams: {textValue: event.target.value}});
    }

    render() {
        const { classes } = this.props;
        return (<FormControl className={classes.formControl}>
                    <TextField 
                        label="Custom Cypher Query"
                        multiline
                        value={this.state.qsParams.textValue}
                        rows={1}
                        rowsMax={4}
                        className={classes.textField}
                        onChange={this.handleClick}
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


FreeForm.propTypes = {
    callback: PropTypes.func.isRequired,
    disable: PropTypes.bool,
    urlQueryString: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    setURLQs: PropTypes.func.isRequired,
};

var FreeFormState = function(state){
    return {
        urlQueryString: state.app.urlQueryString,
    }   
};

var FreeFormDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: 'SET_URL_QS',
                urlQueryString: querystring
            });
        }
    }
}

export default withStyles(styles)(connect(FreeFormState, FreeFormDispatch)(FreeForm));
