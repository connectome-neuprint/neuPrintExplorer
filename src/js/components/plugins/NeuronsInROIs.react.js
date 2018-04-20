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
import ClickableQuery from '../ClickableQuery.react';
import SimpleCellWrapper from '../../helpers/SimpleCellWrapper';

const mainQuery = 'match (neuron :NeuronZZYY)<-[:PartOf]-(roi :Neuropart) XX return neuron.bodyId as bodyid, neuron.name as bodyname, roi.pre as pre, roi.post as post, labels(roi) as rois, neuron.size as size, neuron.pre as npre, neuron.post as npost order by neuron.bodyId';

const preQuery = 'match (m:NeuronYY)-[e:ConnectsTo]->(n:NeuronYY) where m.bodyId=ZZ return n.name as Neuron, n.bodyId as NeuronId, e.weight as Weight order by e.weight desc';
const postQuery = 'match (m:NeuronYY)<-[e:ConnectsTo]-(n:NeuronYY) where m.bodyId=ZZ return n.name as Neuron, n.bodyId as NeuronId, e.weight as Weight order by e.weight desc';

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
    for (let i = 5; i < row1.length; i++) {
        total += row1[i].getValue();
        total2 += row2[i].getValue();
    }

    return total2 - total;
}

var processConnections = function(results, state) {
    // state: sourceId, sourceName, isPre
  
    let tables = [];
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "Neuron ID"),
        new SimpleCellWrapper(index++, "Neuron"),
        new SimpleCellWrapper(index++, "#connections"),
    ];
    
    let data = [];
    let table = {
        header: headerdata,
        body: data,
        name: "Connections " + (state.isPre ? "from " : "to ") + state.sourceName + ":bodyID=" + String(state.sourceId), 
    }
    results.records.forEach(function (record) {
        let bodyid = convert64bit(record.get("NeuronId"));
        let bodyname = record.get("Neuron");
        let weight = convert64bit(record.get("Weight"));
        data.push([
            new SimpleCellWrapper(index++, bodyid),
            new SimpleCellWrapper(index++, bodyname),
            new SimpleCellWrapper(index++, weight),
        ]);
    });
    tables.push(table);
    return tables;
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

var parseResults = function(neoResults, state) {
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
            if (state.inputROIs.indexOf(rois[item]) !== -1) {
                var presize = convert64bit(record.get("pre"));
                if (presize > 0) {
                    inputneuronROIs[bodyid][rois[item]] = presize; 
                }
            }
            if (state.outputROIs.indexOf(rois[item]) !== -1) {
                var postsize = convert64bit(record.get("post"));
                if (postsize > 0) {
                    outputneuronROIs[bodyid][rois[item]] = postsize; 
                }
            }
        }
    });

    // create table
    var tables = [];
 
    let index = 0;
    let headerdata = [
        new SimpleCellWrapper(index++, "id"),
        new SimpleCellWrapper(index++, "neuron"),
        new SimpleCellWrapper(index++, "#voxels"),
        new SimpleCellWrapper(index++, "#pre"),
        new SimpleCellWrapper(index++, "#post"),
    ];

    var titlename = "Neurons " + state.neuronSrc + " with inputs in: " + JSON.stringify(state.inputROIs) + " and outputs in: " + JSON.stringify(state.outputROIs); 
    
    for (let item in state.inputROIs) {
        headerdata.push(new SimpleCellWrapper(index++,
                                             "In:" + state.inputROIs[item]));
    }
    for (let item in state.outputROIs) {
        headerdata.push(new SimpleCellWrapper(index++,
                                             "Out:" + state.outputROIs[item]));
    }

    // load table body
    var formatinfo = [];
    
    const basepreQ = preQuery.replace(/YY/g, state.datasetstr)
    const basepostQ = postQuery.replace(/YY/g, state.datasetstr)

    for (let bodyid in neuronnames) {
        if (Object.keys(inputneuronROIs[bodyid]).length !== state.inputROIs.length) {
            continue;
        }
        if (Object.keys(outputneuronROIs[bodyid]).length !== state.outputROIs.length) {
            continue;
        }
        let preq = basepreQ.replace("ZZ", bodyid);
        let postq = basepostQ.replace("ZZ", bodyid);
        let statepre = {
            sourceId: bodyid,
            sourceName: neuronnames[bodyid].name,
            isPre: true,
        };
        let statepost = {
            sourceId: bodyid,
            sourceName: neuronnames[bodyid].name,
            isPre: false,
        };
        let neoPre = {
            queryStr: preq,
            callback: processConnections,
            isChild: true,
            state: statepre,
        };
        let neoPost = {
            queryStr: postq,
            callback: processConnections,
            isChild: true,
            state: statepost,
        }

        let frowinfo = [];

        frowinfo.push(new SimpleCellWrapper(index++,
                         JSON.stringify(parseInt(bodyid))));
        
        frowinfo.push(new SimpleCellWrapper(index++,
                         JSON.stringify(neuronnames[bodyid].name)));
                    
        frowinfo.push(new SimpleCellWrapper(index++,
                         JSON.stringify(neuronnames[bodyid].size)));
        
        frowinfo.push(new SimpleCellWrapper(index++,
                         (<ClickableQuery neoQueryObj={neoPre}>
                            {JSON.stringify(neuronnames[bodyid].npre)}
                        </ClickableQuery>),
                        false, parseInt(neuronnames[bodyid].npre)));
        frowinfo.push(new SimpleCellWrapper(index++,
                         (<ClickableQuery neoQueryObj={neoPost}>
                            {JSON.stringify(neuronnames[bodyid].npost)}
                        </ClickableQuery>),
                        false, parseInt(neuronnames[bodyid].npost)));
                        
        var presizes = inputneuronROIs[bodyid];
        var postsizes = outputneuronROIs[bodyid];

        for (let index2 = 0; index2 < state.inputROIs.length; index2++) {
            frowinfo.push(new SimpleCellWrapper(index++,
                                parseInt(presizes[state.inputROIs[index2]])));
        }
        for (let index2 = 0; index2 < state.outputROIs.length; index2++) {
            frowinfo.push(new SimpleCellWrapper(index++,
                                parseInt(postsizes[state.outputROIs[index2]])));
        }
        formatinfo.push(frowinfo);
    }

    formatinfo.sort(compareNeuronRows);

    tables.push({
        header: headerdata,
        body: formatinfo,
        name: titlename
    });

    return tables;
}

class NeuronsInROIs extends React.Component {
    static get queryName() {
        return "Find neurons";
    }
    
    static get queryDescription() {
        return "Find neurons that have inputs or outputs in ROIs";
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

            let query = {
                queryStr: neoquery,
                callback: parseResults,    
                state: {
                    neuronSrc: this.state.qsParams.neuronsrc,
                    outputROIs: this.state.qsParams.OutputROIs,
                    inputROIs: this.state.qsParams.InputROIs,
                    datasetstr: this.props.datasetstr, 
                },
            }
            this.props.callback(query);
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
