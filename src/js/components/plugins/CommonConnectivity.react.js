/*
 * Queries common inputs/outputs given list of bodyIds 
*/

""

import React from 'react';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import NeuronFilter from '../NeuronFilter.react';
import queryCommonConnectivity from '../../neo4jqueries/commonConnectivity';
import { withStyles } from '@material-ui/core/styles';
import { setUrlQS } from '../../actions/app';
import { connect } from 'react-redux';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';

const styles = theme => ({
    textField: {
        minWidth: 250,
        maxWidth: 300,
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
});
class CommonConnectivity extends React.Component {

    static get queryName() {
        return "Common Connectivity";
    }

    static get queryDescription() {
        return "Finds common inputs/outputs for a group of bodies and weights of their connections to these inputs/outputs.";
    }

    constructor(props) {
        super(props);
        const initqsParams = {
            typeValue: "input",
            bodyIds: "",
            names: "",
        }
        const qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);

        this.state = {
            qsParams: qsParams,
            limitBig: true,
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
            qsParams: oldParams,
        });
    }

    addNeuronNames = (event) => {
        const oldParams = this.state.qsParams;
        oldParams.names = event.target.value;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldParams));
        this.setState({
            qsParams: oldParams,
        });
    }

    setInputOrOutput = (event) => {
        const oldParams = this.state.qsParams;
        oldParams.typeValue = event.target.value;
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, oldParams));
        this.setState({
            qsParams: oldParams,
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <FormControl className={classes.formControl}>
                    <TextField
                        label="Neuron bodyIds"
                        multiline
                        fullWidth
                        rows={1}
                        value={this.state.qsParams.bodyIds}
                        disabled={this.state.qsParams.names.length > 0}
                        rowsMax={4}
                        className={classes.textField}
                        helperText="Separate ids with commas."
                        onChange={this.addNeuronBodyIds}
                    />
                    <TextField
                        label="Neuron names"
                        multiline
                        fullWidth
                        rows={1}
                        value={this.state.qsParams.names}
                        disabled={this.state.qsParams.bodyIds.length > 0}
                        rowsMax={4}
                        className={classes.textField}
                        helperText="Separate names with commas."
                        onChange={this.addNeuronNames}
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
                    variant="contained"
                    onClick={() => {
                        this.props.callback(queryCommonConnectivity(this.props.datasetstr, this.state.qsParams.bodyIds, this.state.qsParams.names, this.state.limitBig, this.state.statusFilters, this.state.qsParams.typeValue));
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
    classes: PropTypes.object.isRequired,
};

const CommonConnectivityState = function (state) {
    return {
        urlQueryString: state.app.get("urlQueryString"),
    }
};

const CommonConnectivityDispatch = function (dispatch) {
    return {
        setURLQs: function (querystring) {
            dispatch(setUrlQS(querystring));
        }
    }
}


export default withStyles(styles, { withTheme: true })(connect(CommonConnectivityState, CommonConnectivityDispatch)(CommonConnectivity));

