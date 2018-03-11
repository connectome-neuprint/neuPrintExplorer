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

class Query extends React.Component {
    render() {
        var queryname = "Select Query";
        var initmenuitem = (
                                <MenuItem value={queryname}>
                                    {queryname}
                                </MenuItem>
                            );
        var querytype = "";

        // if query is selected, pass query along
        if ("queryType" in this.props.match.params) {
            // check if query is in the list of plugins
            var found = false;
            for (var i in this.props.pluginList) {
                if (this.props.match.params.queryType === this.props.pluginList[i].name) {
                    found = true;
                }
            }
            if (found) {
                queryname = this.props.match.params.queryType;
                querytype = queryname;
                initmenuitem = <div />
            }
        }

        // TODO: fix default menu option (maybe make the custom query the default)
        return (
            <div>
                <Grid item xs={12}> 
                    <FormControl>
                        <InputLabel htmlFor="controlled-open-select">Query Type</InputLabel>
                        <Select
                            value={queryname}
                            onChange={(event) => 
                                queryname === event.target.value ? 0 :this.props.history.push(event.target.value)}
                            inputProps={{
                                name: 'query',
                                id: 'controlled-open-select',
                            }}
                        >
                            {initmenuitem}
                            {this.props.pluginList.map(function (val) {
                                return (<MenuItem
                                            key={val.name}
                                            value={val.name}
                                        >
                                            {val.name}
                                        </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}> 
                    <QueryForm queryType={querytype} />
                </Grid>
            </div>
        );
    }
}

// establish default values for props
/*
Query.defaultProps = {
    match: {
        params: {
            queryType: ""
        }
    }
};
*/

Query.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            queryType: PropTypes.string   
        })
    }),
    pluginList: PropTypes.array,
    history: PropTypes.object
};


var QueryState = function(state){
    return {
        pluginList: state.pluginList
    }   
};

export default connect(QueryState, null)(Query);

