/*
 * Plugin for body size distribution.
*/

"use strict"

import React from 'react';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import queryDistribution from '../../neo4jqueries/distribution';
import { LoadQueryString, SaveQueryString } from '../../helpers/qsparser';
import {connect} from 'react-redux';
import { withStyles } from 'material-ui/styles';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { setUrlQS } from '../../actions/app';

const styles = theme => ({
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 250,
        maxWidth: 300,
    },
});


class Distribution extends React.Component {
    static get queryName() {
        return "Distribution";
    }
    
    static get queryDescription() {
        return "Shows segment size distribution for segments in a given region.";
    }

    constructor(props) {
        super(props);
        let roi = "NO ROI"; // leaving empty causes issues
        if (this.props.availableROIs.length > 0) {
            roi = this.props.availableROIs[0];
        }

        let initqsParams = {
            roi: roi,
            type: "presyn",
        }
        let qsParams = LoadQueryString("Query:" + this.constructor.queryName, initqsParams, this.props.urlQueryString);
        this.state = {
            qsParams: qsParams 
        };
    }

    setROI = (event) => {
        let roiname = event.target.value;
        
        let newparams = Object.assign({}, this.state.qsParams, {roi: roiname});
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, newparams));
        
        this.setState({qsParams: newparams});
    }

    setType = (event) => {
        let type = event.target.value;
        
        let newparams = Object.assign({}, this.state.qsParams, {type: type});
        this.props.setURLQs(SaveQueryString("Query:" + this.constructor.queryName, newparams));
        
        this.setState({qsParams: newparams});
    }



    render() {
        const { classes } = this.props;
        return (
                <FormControl className={classes.formControl}>
                    <Select
                        value={this.state.qsParams.roi}
                        onChange={this.setROI}
                        >
                        {this.props.availableROIs.map((val) => {
                            return (<MenuItem
                                        key={val}
                                        value={val}
                                    >
                                        {val}
                                    </MenuItem>
                            );
                        })}
                    </Select>
                    <Select
                        value={this.state.qsParams.type}
                        onChange={this.setType}
                        inputProps={{
                            name: 'Data type used for distribution',
                            id: 'controlled-open-select',
                        }}
                    >
                        <MenuItem
                                        key={"presyn"}
                                        value={"presyn"}
                                    >
                                        Pre-synaptic
                        </MenuItem>
                        <MenuItem
                                        key={"postsyn"}
                                        value={"postsyn"}
                                    >
                                        Post-synaptic
                        </MenuItem>
                    </Select>
                
                    <Button
                        variant="raised"
                        onClick={() => {
                            this.props.callback(queryDistribution(this.props.datasetstr, this.state.qsParams.roi, this.state.qsParams.type));
                        }}
                    >
                        Submit
                    </Button>
                </FormControl>
        );
    }
}

Distribution.propTypes = {
    callback: PropTypes.func.isRequired,
    datasetstr: PropTypes.string.isRequired,
    setURLQs: PropTypes.func.isRequired,
    availableROIs: PropTypes.array.isRequired,
    classes: PropTypes.object.isRequired,
    urlQueryString: PropTypes.string.isRequired,
};

var DistributionState = function(state){
    return {
        urlQueryString: state.app.get("urlQueryString"),
    }   
};

var DistributionDispatch = function(dispatch) {
    return {
        setURLQs: function(querystring) {
            dispatch(setUrlQS(querystring));
        }
    }
}

export default withStyles(styles)(connect(DistributionState, DistributionDispatch)(Distribution));
