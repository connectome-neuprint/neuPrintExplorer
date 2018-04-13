/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';
import Button from 'material-ui/Button';
import { FormControl } from 'material-ui/Form';
import PropTypes from 'prop-types';
var neo4j = require('neo4j-driver').v1;
import { withStyles } from 'material-ui/styles';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import Input, { InputLabel } from 'material-ui/Input';
import {connect} from 'react-redux';
import Chip from 'material-ui/Chip';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import NeuronHelp from '../NeuronHelp.react';

const mainQuery = 'match (neuron :NeuronZZYY)<-[:PartOf]-(roi :Neuropart) XX return neuron.bodyId as bodyid, neuron.name as bodyname, roi.pre as pre, roi.post as post, labels(roi) as rois, neuron.size as size, neuron.pre as npre, neuron.post as npost order by neuron.bodyId';


var inputROIsHack = [];
var outputROIsHack = [];
var NeuronSrcHack = "";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function convert64bit(value) {
    return neo4j.isInt(value) ?
        (neo4j.integer.inSafeRange(value) ? 
            value.toNumber() : value.toString()) 
        : value;
}

function compareNeuronRows(row1, row2) {
    var total = 0;
    var total2 = 0;
    for (let i = 2; i < row1.length; i++) {
        total += row1[i];
        total2 += row2[i];
    }

    return total2 - total;
}

const styles = theme => ({
    textField: {
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 250,
        maxWidth: 300,
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
});

class NeuronsInROIs extends React.Component {
    static get queryName() {
        return "Find neurons";
    }
    
    static get queryDescription() {
        return "Find neurons that have inputs or outputs in ROIs";
    }
 
    static parseResults(neoResults) {
        var inputneuronROIs = {};
        var outputneuronROIs = {};
        var neuronnames = {}; 
        
        neoResults.records.forEach(function (record) {
            var bodyid = convert64bit(record.get("bodyid"));
            if (!(bodyid in inputneuronROIs)) {
                inputneuronROIs[bodyid] = {};
                outputneuronROIs[bodyid] = {};
                neuronnames[bodyid] = {};
                neuronnames[bodyid]["name"] = record.get("bodyname");
                neuronnames[bodyid]["size"] = convert64bit(record.get("size"));
                neuronnames[bodyid]["pre"] = convert64bit(record.get("npre"));
                neuronnames[bodyid]["post"] = convert64bit(record.get("npost"));
            }

            var rois = record.get("rois");
            for (let item in rois) {
                if (inputROIsHack.indexOf(rois[item]) !== -1) {
                    var presize = convert64bit(record.get("pre"));
                    if (presize > 0) {
                        inputneuronROIs[bodyid][rois[item]] = presize; 
                    }
                }
                if (outputROIsHack.indexOf(rois[item]) !== -1) {
                    var postsize = convert64bit(record.get("post"));
                    if (postsize > 0) {
                        outputneuronROIs[bodyid][rois[item]] = postsize; 
                    }
                }
            }
        });

        // create table
        var tables = [];
        var headerdata = ["neuron", "id", "#voxels", "#pre", "#post"];
      
        var titlename = "Neurons " + NeuronSrcHack + " with inputs in: " + JSON.stringify(inputROIsHack) + " and outputs in: " + JSON.stringify(outputROIsHack); 
        
        for (let item in inputROIsHack) {
            headerdata.push("In:" + inputROIsHack[item]);
        }
        for (let item in outputROIsHack) {
            headerdata.push("Out:" + outputROIsHack[item]);
        }

        // load table body
        var tableinfo = [];
        for (let bodyid in neuronnames) {
            if (Object.keys(inputneuronROIs[bodyid]).length !== inputROIsHack.length) {
                continue;
            }
            if (Object.keys(outputneuronROIs[bodyid]).length !== outputROIsHack.length) {
                continue;
            }
            var rowinfo = [neuronnames[bodyid].name, bodyid, neuronnames[bodyid].size, neuronnames[bodyid].npre, neuronnames[bodyid].npost];
            var presizes = inputneuronROIs[bodyid];
            var postsizes = outputneuronROIs[bodyid];

            for (let index = 0; index < inputROIsHack.length; index++) {
                rowinfo.push(presizes[inputROIsHack[index]]);
            }
            for (let index = 0; index < outputROIsHack.length; index++) {
                rowinfo.push(postsizes[outputROIsHack[index]]);
            }
            tableinfo.push(rowinfo);
        }

        // sort table so neurons with the most synapses in the ROIs are first
        tableinfo.sort(compareNeuronRows);

        tables.push({
            header: headerdata,
            body: tableinfo,
            name: titlename
        });

        return tables;
    }

    constructor(props) {
        super(props);
        var initqsParams = {
            InputROIs: [],
            OutputROIs: [],
            neuronsrc: "",
        }
        var qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams
        };
    }

    processRequest = () => {
        if ((this.state.qsParams.InputROIs.length > 0) ||
            (this.state.qsParams.OutputROIs.length > 0)) {
   
            inputROIsHack = this.state.qsParams.InputROIs;
            outputROIsHack = this.state.qsParams.OutputROIs;

            // parse ROIs
            var roisstr = "";
            for (let item in this.state.qsParams.InputROIs) {
                roisstr = roisstr + ":" + this.state.qsParams.InputROIs[item];
            }
            for (let item in this.state.qsParams.OutputROIs) {
                roisstr = roisstr + ":" + this.state.qsParams.OutputROIs[item];
            }

            var neoquery = mainQuery.replace(/ZZ/g, roisstr);
            neoquery = neoquery.replace(/YY/g, this.props.datasetstr);

            // filter neuron information
            if (this.state.qsParams.neuronsrc === "") {
                neoquery = neoquery.replace("XX", "");

            } else if (isNaN(this.state.qsParams.neuronsrc)) {
                neoquery = neoquery.replace("XX", 'where neuron.name =~"' + this.state.qsParams.neuronsrc + '"');
            } else {
                neoquery = neoquery.replace("XX", 'where neuron.bodyId =' + this.state.qsParams.neuronsrc);
            }
            NeuronSrcHack = this.state.qsParams.neuronsrc;

            
            this.props.callback(neoquery);
        }

    }

    handleChangeROIsIn = (event) => {
        var rois = event.target.value;
        if (event === undefined) {
            rois = [];
        }
        var oldparams = this.state.qsParams;
        oldparams.InputROIs = rois;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldparams));
        
        this.setState({qsParams: oldparams});
    }

    handleChangeROIsOut = (event) => {
        var rois = event.target.value;
        if (event === undefined) {
            rois = [];
        }
        var oldparams = this.state.qsParams;
        oldparams.OutputROIs = rois;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldparams));
        
        this.setState({qsParams: oldparams});
    }

    addNeuron = (event) => {
        var oldparams = this.state.qsParams;
        oldparams.neuronsrc = event.target.value;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldparams));
        this.setState({qsParams: oldparams});
    }

    render() {
        const { classes, theme } = this.props;
        return (<div>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="select-multiple-chip">Input ROIs</InputLabel>
                    <Select
                        multiple
                        value={this.state.qsParams.InputROIs}
                        onChange={this.handleChangeROIsIn}
                        input={<Input id="select-multiple-chip" />}
                        renderValue={selected => (
                            <div className={classes.chips}>
                                {selected.map(value => (<Chip
                                                            key={value}
                                                            label={value}
                                                            className={classes.chip} 
                                                        />)
                                )}
                            </div>
                        )}
                        MenuProps={MenuProps}
                    >
                    {this.props.availableROIs.map(name => (
                        <MenuItem
                        key={name}
                        value={name}
                        style={{
                            fontWeight:
                            this.state.qsParams.InputROIs.indexOf(name) === -1
                                ? theme.typography.fontWeightRegular
                                : theme.typography.fontWeightMedium,
                        }}
                        >
                        {name}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="select-multiple-chip">Output ROIs</InputLabel>
                    <Select
                        multiple
                        value={this.state.qsParams.OutputROIs}
                        onChange={this.handleChangeROIsOut}
                        input={<Input id="select-multiple-chip" />}
                        renderValue={selected => (
                            <div className={classes.chips}>
                                {selected.map(value => (<Chip 
                                                            key={value + "_post"}
                                                            label={value}
                                                            className={classes.chip} 
                                                        />)
                                )}
                            </div>
                        )}
                        MenuProps={MenuProps}
                    >
                    {this.props.availableROIs.map(name => (
                        <MenuItem
                        key={name + "_post"}
                        value={name}
                        style={{
                            fontWeight:
                            this.state.qsParams.OutputROIs.indexOf(name) === -1
                                ? theme.typography.fontWeightRegular
                                : theme.typography.fontWeightMedium,
                        }}
                        >
                        {name}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <NeuronHelp>
                    <TextField 
                        label="Neuron name (optional)"
                        multiline
                        rows={1}
                        value={this.state.qsParams.neuronsrc}
                        rowsMax={4}
                        className={classes.textField}
                        onChange={this.addNeuron}
                    />
                    </NeuronHelp>
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

NeuronsInROIs.propTypes = {
    callback: PropTypes.func.isRequired,
    disable: PropTypes.bool,
    setURLQs: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    datasetstr: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    urlQueryString: PropTypes.string.isRequired,
    availableROIs: PropTypes.array.isRequired
};


var NeuronsInROIsState = function(state){
    return {
        urlQueryString: state.app.urlQueryString,
        availableROIs: state.neo4jsettings.availableROIs,
    }   
};

var NeuronsInROIsDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: 'SET_URL_QS',
                urlQueryString: querystring
            });
        }
    }
}


export default withStyles(styles, { withTheme: true })(connect(NeuronsInROIsState, NeuronsInROIsDispatch)(NeuronsInROIs));
