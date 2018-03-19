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
import Neo4jQuery from './Neo4jQuery.react';
import qs from 'qs';

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
        var query = qs.parse(window.location.search.substring(1));
        var queryType = "";
        if ("queryType" in query) {
            queryType = query["queryType"];
        }
        this.state = {
            queryType: queryType 
        };
    }
   
    setQuery = (event) => {
        if (event.target.value !== this.state.queryType) {
            var query = qs.parse(window.location.search.substring(1));
            query["queryType"] = event.target.value; 
            history.replaceState(null, null, window.location.pathname + "?" + qs.stringify(query));
     
            this.setState({queryType: event.target.value});
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

        // ?! on submit link to results

        // if query is selected, pass query along
        if (this.state.queryType !== "") {
            // check if query is in the list of plugins
            var found = false;
            for (var i in this.props.pluginList) {
                if (this.state.queryType === this.props.pluginList[i].queryName) {
                    found = true;
                }
            }
            if (found) {
                queryname = this.state.queryType;
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
                <Neo4jQuery />
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

