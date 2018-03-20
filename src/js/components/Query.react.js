/*
 * Main page holding query selector and query forms.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import QueryForm from "./QueryForm.react";

import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';
import { InputLabel } from 'material-ui/Input';
import Grid from 'material-ui/Grid';
import Divider from 'material-ui/Divider';
import { withStyles } from 'material-ui/styles';
import { LoadQueryString, SaveQueryString, RemoveQueryString } from '../qsparser';

const styles = theme => ({
    root: {
        padding: theme.spacing.unit*3,
    },
    divider: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
    }
});

class Query extends React.Component {
    constructor(props) {
        super(props);
        var initqsParams = {
            queryType: "",
        }
        var qsParams = LoadQueryString("Query", initqsParams);
        this.state = {
            qsParams: qsParams
        };
    }
  
    componentWillUpdate(nextProps, nextState) {
        SaveQueryString("Query", nextState.qsParams);
    }

    setQuery = (event) => {
        if (event.target.value !== this.state.qsParams.queryType) {
            // delete query string from last query
            var found = false;
            for (var i in this.props.pluginList) {
                if (this.state.qsParams.queryType === this.props.pluginList[i].queryName) {
                    found = true;
                }
            }

            if (found) {
                RemoveQueryString("Query:" + this.state.qsParams.queryType);
            }

            this.setState({qsParams: {
                            queryType: event.target.value}});
        }
    };

    render() {
        const { classes } = this.props;
        
        var queryname = "Select Query";
        var querytype = "";
        var initmenuitem = (
                                <MenuItem value={queryname}>
                                    {queryname}
                                </MenuItem>
                            );

        // if query is selected, pass query along
        if (this.state.qsParams.queryType !== "") {
            // check if query is in the list of plugins
            var found = false;
            for (var i in this.props.pluginList) {
                if (this.state.qsParams.queryType === this.props.pluginList[i].queryName) {
                    found = true;
                }
            }
            if (found) {
                queryname = this.state.qsParams.queryType;
                querytype = queryname;
                initmenuitem = <div />
            }
        }

        // TODO: fix default menu option (maybe make the custom query the default)
        return (
            <div className={classes.root}>
                <FormControl>
                    <InputLabel htmlFor="controlled-open-select">Query Type</InputLabel>
                    <Select
                        value={queryname}
                        onChange={this.setQuery}
                        inputProps={{
                            name: 'query',
                            id: 'controlled-open-select',
                        }}
                    >
                        {initmenuitem}
                        {this.props.pluginList.map(function (val) {
                            return (<MenuItem
                                        key={val.queryName}
                                        value={val.queryName}
                                    >
                                        {val.queryName}
                                    </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <Divider className={classes.divider} />
                <QueryForm queryType={querytype} />
            </div>
        );
    }
}

// establish default values for props
/*
Query.defaultProps = {
};
*/

Query.propTypes = {
    pluginList: PropTypes.array,
    history: PropTypes.object
};


var QueryState = function(state){
    return {
        pluginList: state.pluginList
    }   
};

export default withStyles(styles)(connect(QueryState, null)(Query));

