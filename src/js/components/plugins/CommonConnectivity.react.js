/*
 * Queries common inputs/outputs given list of bodyIds 
*/

"use strict"

import React from 'react';
import Button from 'material-ui/Button';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import { Radio, RadioGroup } from 'material-ui/'
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';
import NeuronFilter from '../NeuronFilter.react';
import queryCommonConnectivity from '../../neo4jqueries/commonConnectivity';
import { withStyles } from 'material-ui/styles';
import C from "../../reducers/constants"
import {connect} from 'react-redux';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';

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
class CommonConnectivity extends React.Component {

    static get queryName() {
        return "CommonConnectivity";
    }

    static get queryDescription() {
        return "Finds common inputs/outputs for a group of bodies and weights of their connections to these inputs/outputs.";
    }

    constructor(props) {
        super(props);
        const initqsParams = {
            typeValue: "input",
            bodyIds: "",
        }
        const qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);

        this.state = {
            qsParams: qsParams,
            limitBig: true,
            bodyIds: "",
            typeValue: "input",
        }
    }

    loadNeuronFilters = (params) => {
        this.setState({
            limitBig: params.limitBig,
            statusFilters: params.statusFilters
        });
    }

    addNeuronBodyIds = (event) => {
        const oldParams = this.state.qsParams;
        oldParams.bodyIds = event.target.value;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldParams));
        this.setState({ 
            bodyIds: event.target.value,
            qsParams: oldParams,
         });
    }

    setInputOrOutput = (event) => {
        const typeValue = event.target.value;
        const oldParams = this.state.qsParams;
        oldParams.typeValue = typeValue;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldParams));
        this.setState({ 
            typeValue: typeValue,
            qsParams: oldParams,
         });
    }

    render() {
        return (
            <div>
                <FormControl>
                    <TextField
                        label="Neuron bodyIds (separated by commas)"
                        multiline
                        fullWidth
                        rows={2}
                        value={this.state.qsParams.bodyIds}
                        rowsMax={4}
                        onChange={this.addNeuronBodyIds}
                    />
                    <RadioGroup
                        aria-label="Type Of Connections"
                        name="type"
                        value={this.state.qsParams.typeValue}
                        onChange={this.setInputOrOutput}
                    >
                        <FormControlLabel 
                        value="input" 
                        control={<Radio />} 
                        label="Inputs" />
                        <FormControlLabel 
                        value="output" 
                        control={<Radio />} 
                        label="Outputs" />
                    </RadioGroup>

                </FormControl>
                <NeuronFilter
                    callback={this.loadNeuronFilters}
                    datasetstr={this.props.datasetstr}
                />
                <Button
                    variant="raised"
                    onClick={() => {
                        this.props.callback(queryCommonConnectivity(this.props.datasetstr, this.state.bodyIds, this.state.limitBig, this.state.statusFilters, this.state.typeValue));
                    }}
                >
                    Submit
                        </Button>
            </div>
        );
    }
}

CommonConnectivity.propTypes = {
    callback: PropTypes.func.isRequired,
    datasetstr: PropTypes.string.isRequired,
    setURLQs: PropTypes.func.isRequired,
    urlQueryString: PropTypes.string.isRequired,
};

const CommonConnectivityState = function(state){
    return {
        urlQueryString: state.app.urlQueryString,
    }   
};

const CommonConnectivityDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: C.SET_URL_QS,
                urlQueryString: querystring
            });
        }
    }
}


export default withStyles(styles, { withTheme: true })(connect(CommonConnectivityState, CommonConnectivityDispatch)(CommonConnectivity));

