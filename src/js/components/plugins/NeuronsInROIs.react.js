/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';
import Button from 'material-ui/Button';
import { FormControl } from 'material-ui/Form';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import Input, { InputLabel } from 'material-ui/Input';
import {connect} from 'react-redux';
import Chip from 'material-ui/Chip';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import NeuronHelp from '../NeuronHelp.react';
import NeuronFilter from '../NeuronFilter.react';
import { parseResults } from '../../neo4jqueries/neuronsInROIs';
//import _ from "underscore";
import C from "../../reducers/constants"

const mainQuery = 'MATCH (neuron :`YY-Neuron`ZZ) XX FF GG RETURN neuron.bodyId AS bodyid, neuron.name AS bodyname, neuron.synapseCountPerRoi AS roiInfo, neuron.size AS size, neuron.pre AS npre, neuron.post AS npost ORDER BY neuron.bodyId';

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
 
    constructor(props) {
        super(props);
        var initqsParams = {
            InputROIs: [],
            OutputROIs: [],
            neuronsrc: "",
        }
        var qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams,
            limitBig: true,
            statusFilters: [],
        };
    }
    
    /*
    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.availableROIs, this.props.availableROIs)) {
            var oldparams = this.state.qsParams;
            oldparams.InputROIs = [];
            oldparams.OutputROIs = [];
            this.setState({qsParams: oldparams});
            this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldparams));
        }
    }*/

    processRequest = () => {
        // parse ROIs
        var roisstr = "";
        for (let item in this.state.qsParams.InputROIs) {
            roisstr = roisstr + ":`" + this.state.qsParams.InputROIs[item] + "`";
        }
        for (let item in this.state.qsParams.OutputROIs) {
            roisstr = roisstr + ":`" + this.state.qsParams.OutputROIs[item] + "`";
        }

        var neoquery = mainQuery.replace(/ZZ/g, roisstr);
        neoquery = neoquery.replace(/YY/g, this.props.datasetstr);

        // filter neuron information
        if (this.state.qsParams.neuronsrc === "") {
            neoquery = neoquery.replace("XX", "");

        } else if (isNaN(this.state.qsParams.neuronsrc)) {
            neoquery = neoquery.replace("XX", 'WHERE neuron.name =~"' + this.state.qsParams.neuronsrc + '"');
        } else {
            neoquery = neoquery.replace("XX", 'WHERE neuron.bodyId =' + this.state.qsParams.neuronsrc);
        }
        
        if (this.state.statusFilters.length > 0) {
            let FF = "AND (";
            if (this.state.qsParams.neuronsrc === "") {
                FF = "WHERE (";
            }

            for (let i = 0; i < this.state.statusFilters.length; i++) {
                if (i > 0) {
                    FF = FF + " OR ";
                }
                FF = FF + 'neuron.status = "' + this.state.statusFilters[i] + '"';
            }
            FF = FF + ")";

            neoquery = neoquery.replace("FF", FF);
        } else {
            neoquery = neoquery.replace("FF", "");
        }

        if (this.state.limitBig === "true") {
            let GG = "WHERE ((neuron.pre > 1))"
            if ((this.state.qsParams.neuronsrc !== "") || (this.state.statusFilters.length > 0)) {
                GG = "AND ((neuron.pre > 1))"
            } 
            neoquery = neoquery.replace("GG", GG);
        } else {
            neoquery = neoquery.replace("GG", "");
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

    loadNeuronFilters = (params) => {
        this.setState({limitBig: params.limitBig, statusFilters: params.statusFilters});
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
                <NeuronFilter
                                callback={this.loadNeuronFilters}
                                datasetstr={this.props.datasetstr}
                />
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
    }   
};

var NeuronsInROIsDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: C.SET_URL_QS,
                urlQueryString: querystring
            });
        }
    }
}


export default withStyles(styles, { withTheme: true })(connect(NeuronsInROIsState, NeuronsInROIsDispatch)(NeuronsInROIs));
