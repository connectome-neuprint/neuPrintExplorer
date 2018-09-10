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
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Typography from 'material-ui/Typography';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import Chip from 'material-ui/Chip';
import { MenuItem } from 'material-ui/Menu';
import Tooltip from 'material-ui/Tooltip';
import C from "../reducers/constants"
import NeuPrintResult from '../helpers/NeuPrintResult';


const mainQuery = 'MATCH (n :`ZZ-Neuron`) WHERE n.pre > 1 RETURN DISTINCT n.status AS val'

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 250,
        maxWidth: 300,
    },
    expandablePanel: {
        margin: theme.spacing.unit,
    },
    nopad: {
        padding: 0,
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
});

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

class NeuronFilter extends React.Component {
    constructor(props) {
        super(props);

        let initqsParams = {
            limitBig: "true",
            statusFilters: [],
        }
        let qsParams = LoadQueryString("Query:NeuronFilter", initqsParams, this.props.urlQueryString);
        this.state = {
            statuses: [],
            qsParams: qsParams
        };
        this.props.callback(qsParams);

        this.queryStatuses(this.props.neoServer, this.props.datasetstr);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.neoServer !== this.props.neoServer || (nextProps.datasetstr !== this.props.datasetstr)) {
            this.queryStatuses(nextProps.neoServer, nextProps.datasetstr);
        }
    }

    queryStatuses = (neoServer, datasetstr) => {
        if (neoServer === "") {
            return;
        }
        
        const setState = this.setState.bind(this)
        let neoQuery = mainQuery.replace(/ZZ/g, datasetstr);
        fetch('/api/custom/custom', {
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({"cypher": neoQuery}),
            method: 'POST',
        })
        .then(result=>result.json())
        .then(resp => {
            let statuslist = [];
            // parse query
            let result = new NeuPrintResult(resp); 
            result.records.forEach(function (record) {
                let val = record.get("val");
                if (val !== null) {
                    statuslist.push(val);
                }
            });
            setState({"statuses": statuslist});
        })
        .catch(function (error) {
            alert(error);
        });
    }

    toggleBig = () => {
        let val = (this.state.qsParams.limitBig === "true") ? "false" : "true";

        let newparams = Object.assign({}, this.state.qsParams, {limitBig: val});
        this.props.setURLQs(SaveQueryString("Query:NeuronFilter", newparams));
   
        this.props.callback(newparams);
        this.setState({qsParams: newparams});
    }
   
    handleStatus = (event) => {
        let statuses = event.target.value;
        if (event === undefined) {
            statuses = [];
        }
        let newparams = Object.assign({}, this.state.qsParams, {statusFilters: statuses});
       
        // save back status selections
        this.props.setURLQs(SaveQueryString("Query:NeuronFilter", newparams));
        this.props.callback(newparams);
        this.setState({qsParams: newparams});
    }

    render() {
        const { classes, theme } = this.props;
        let checkbox = this.state.qsParams.limitBig === "true" ? true : false;
        return (
                <ExpansionPanel className={classes.expandablePanel}>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>
                            Optional neuron/segment filters
                        </Typography> 
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.nopad}>
                        <FormControl className={classes.formControl}>
                        <FormControl className={classes.formControl}>
                            <Tooltip 
                                        id="tooltip-big" 
                                        title="Limit to big neurons (>10 pre or post synapses)" 
                                        placement="bottom-start"
                            >
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
                            </Tooltip>
                        </FormControl>
                        <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="select-multiple-chip-status">Neuron status</InputLabel>
                        <Select
                            multiple
                            value={this.state.qsParams.statusFilters}
                            onChange={this.handleStatus}
                            input={<Input id="select-multiple-chip-status" />}
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
                        {this.state.statuses.map(name => (
                            <MenuItem
                            key={name}
                            value={name}
                            style={{
                                fontWeight:
                                this.state.qsParams.statusFilters.indexOf(name) === -1
                                    ? theme.typography.fontWeightRegular
                                    : theme.typography.fontWeightMedium,
                            }}
                            >
                            {name}
                            </MenuItem>
                        ))}
                        </Select>
                        </FormControl>
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
    theme: PropTypes.object.isRequired,
    urlQueryString: PropTypes.string.isRequired,
    datasetstr: PropTypes.string.isRequired,
    neoServer: PropTypes.string.isRequired,
};

var NeuronFilterState = function(state){
    return {
        urlQueryString: state.app.urlQueryString,
        neoServer: state.neo4jsettings.neoServer,
    }   
};

var NeuronFilterDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch({
                type: C.SET_URL_QS,
                urlQueryString: querystring
            });
        }
    }
}

export default withStyles(styles, { withTheme: true })(connect(NeuronFilterState, NeuronFilterDispatch)(NeuronFilter));

