/*
 * Form to provide filters based on neuron properties.
*/

"use strict"

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { LoadQueryString, SaveQueryString } from '../helpers/qsparser';
import {connect} from 'react-redux';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Checkbox from 'material-ui/Checkbox';
import NeuronHelp from './NeuronHelp.react';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 250,
        maxWidth: 300,
    },
    nopad: {
        padding: 0,
    }
});

class NeuronFilter extends React.Component {
    constructor(props) {
        super(props);

        let initqsParams = {
            limitBig: "true",
        }
        let qsParams = LoadQueryString("Query:NeuronFilter", initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams
        };
        this.props.callback(qsParams);
    }

    toggleBig = () => {
        let val = (this.state.qsParams.limitBig === "true") ? "false" : "true";

        let newparams = Object.assign({}, this.state.qsParams, {limitBig: val});
        this.props.setURLQs(SaveQueryString("Query:NeuronFilter", newparams));
   
        this.props.callback(newparams);
        this.setState({qsParams: newparams});
    }
    
    render() {
        const { classes } = this.props;
        let checkbox = this.state.qsParams.limitBig === "true" ? true : false;
        return (
                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            Optional neuron/segment filters
                        </Typography> 
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.nopad}>
                        <FormControl className={classes.formControl}>
                            <NeuronHelp text={"Limit search to big neurons with >10 pre or post synapses (speeds-up querying)"}>
                                <FormControlLabel
                                                    control={
                                                            <Checkbox
                                                                checked={checkbox}
                                                                onChange={this.toggleBig}
                                                                value="checkedBig"
                                                            />   
                                                            }
                                                    label="Limit to big segments"
                                />
                            </NeuronHelp>
                        </FormControl>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
        );
    }
}

NeuronFilter.propTypes = {
    callback: PropTypes.func.isRequired,
    setURLQs: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    urlQueryString: PropTypes.string.isRequired,
    datasetstr: PropTypes.string.isRequired,
};

var NeuronFilterState = function(state){
    return {
        urlQueryString: state.app.urlQueryString,
    }   
};

var NeuronFilterDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: 'SET_URL_QS',
                urlQueryString: querystring
            });
        }
    }
}

export default withStyles(styles)(connect(NeuronFilterState, NeuronFilterDispatch)(NeuronFilter));

