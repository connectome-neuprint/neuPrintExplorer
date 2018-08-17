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

export default class CommonConnectivity extends React.Component {

    static get queryName() {
        return "CommonConnectivity";
    }

    static get queryDescription() {
        return "Finds common inputs/outputs for a group of bodies and weights of their connections to these inputs/outputs.";
    }

    constructor(props) {
        super(props);

        this.state = {
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
        this.setState({ bodyIds: event.target.value });
    }

    setInputOrOutput = (event) => {
        this.setState({ typeValue: event.target.value });
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
                        defaultValue=""
                        rowsMax={4}
                        onChange={this.addNeuronBodyIds}
                    />
                    <RadioGroup
                        aria-label="Type Of Connections"
                        name="type"
                        value={this.state.typeValue}
                        onChange={this.setInputOrOutput}
                    >
                        <FormControlLabel value="input" control={<Radio />} label="Inputs" />
                        <FormControlLabel value="output" control={<Radio />} label="Outputs" />
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
};

