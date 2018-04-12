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
import NeuronHelp from '../NeuronHelp.react';

const mainQuery = 'match (neuron :NeuronYY)<-[:PartOf]-(roi :Neuropart) where ZZ return neuron.bodyId as bodyid, neuron.name as bodyname, roi.pre as pre, roi.post as post, labels(roi) as rois order by neuron.bodyId';

var availableROIsHack = [];

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

const styles = () => ({
  textField: {
  },
  formControl: {
  },
});

function compareNeuronRows1plus(row1, row2) {
    var total = 0;
    var total2 = 0;
    for (let i = 1; i < row1.length; i++) {
        total += row1[i];
        total2 += row2[i];
    }

    return total2 - total;
}

function compareNeuronRows1(row1, row2) {
    return row2[1] - row1[1];    
}

function compareNeuronRows2(row1, row2) {
    return row2[2] - row1[2];    
}

class ROIsIntersectingNeurons extends React.Component {
    static get queryName() {
        return "ROIs in Neuron";
    }
    
    static get queryDescription() {
        return "Find ROIs that intersect a given neuron(s).  A putative name is given based on top two ROI inputs and outputs";
    }

    static parseResults(neoResults) {
        var tableBody = {}
        var tables = [];
        var headerdata = ["ROI name", "Inputs", "Outputs"];

        neoResults.records.forEach(function (record) {
            var bodyid = convert64bit(record.get("bodyid"));
            if (!(bodyid in tableBody)) {
                tableBody[bodyid] = {};
                tableBody[bodyid]["body"] = [];
                tableBody[bodyid]["name"] = record.get("bodyname");
            }
          
            var rois = record.get("rois");
            for (let item in rois) {
                if (availableROIsHack.indexOf(rois[item]) !== -1) {
                    tableBody[bodyid]["body"].push([rois[item], convert64bit(record.get("pre")), convert64bit(record.get("post"))]);
                }
            }
        });
        
        for (let item in tableBody) {
            var data = tableBody[item]["body"];
            
            // grab name based on top two ids
            data.sort(compareNeuronRows1); // sort by pre
            var prename = "";
            for (let i = 0; i < data.length; i++) {
                if (i == 2 || data[i][1] === null) {
                    break;
                }
                prename += data[i][0];
            }
            data.sort(compareNeuronRows2); // sort by post
            var postname = "";
            for (let i = 0; i < data.length; i++) {
                if (i == 2 || data[i][2] === null) {
                    break;
                }
                postname += data[i][0];
            }

            data.sort(compareNeuronRows1plus); // sort by total
            var name = prename + "=>" + postname + ": " + tableBody[item].name + " id=(" + String(item) + ")";
            var table = {header: headerdata, body: data, name: name};
            tables.push(table);
        }

        return tables;
    }

    constructor(props) {
        super(props);
        var initqsParams = {
            neuronsrc: "",
        }
        var qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams
        };
    }

    processRequest = () => {
        if (this.state.qsParams.neuronsrc !== "") {
            availableROIsHack = this.props.availableROIs;
            var neoquery = "";
            
            if (isNaN(this.state.qsParams.neuronsrc)) {
                neoquery = mainQuery.replace("ZZ", 'neuron.name =~"' + this.state.qsParams.neuronsrc + '"');
            } else {
                neoquery = mainQuery.replace("ZZ", 'neuron.bodyId =' + this.state.qsParams.neuronsrc);
            }
            neoquery = neoquery.replace(/YY/g, this.props.datasetstr)
            this.props.callback(neoquery);
        }
    }

    handleClick = (event) => {
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, {neuronsrc: event.target.value}));
        this.setState({qsParams: {neuronsrc: event.target.value}});
    }

    render() {
        const { classes } = this.props;
        return (<FormControl className={classes.formControl}>
                    <NeuronHelp>
                    <TextField 
                        label="Neuron name"
                        multiline
                        rows={1}
                        value={this.state.qsParams.neuronsrc}
                        rowsMax={4}
                        className={classes.textField}
                        onChange={this.handleClick}
                    />
                    </NeuronHelp>
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

ROIsIntersectingNeurons.propTypes = {
    callback: PropTypes.func.isRequired,
    disable: PropTypes.bool,
    urlQueryString: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    setURLQs: PropTypes.func.isRequired,
    availableROIs: PropTypes.array.isRequired,
    datasetstr: PropTypes.string.isRequired,
};


var ROIsIntersectingNeuronsState = function(state){
    return {
        urlQueryString: state.urlQueryString,
        availableROIs: state.availableROIs,
    }   
};

var ROIsIntersectingNeuronsDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: 'SET_URL_QS',
                urlQueryString: querystring
            });
        }
    }
}


export default withStyles(styles)(connect(ROIsIntersectingNeuronsState, ROIsIntersectingNeuronsDispatch)(ROIsIntersectingNeurons));
