/*
 * Main page holding query selector and query forms.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

import QueryForm from "./QueryForm.react";
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

class Query extends React.Component {
    constructor(props) {
        super(props);
    }
    
    static defaultProps = {
        match: {
            params: {
                queryType: ""
            }
        }
    }
    
    render() {
        var queryname = "Select Query";
        var initmenuitem = <MenuItem value={queryname} primaryText={queryname} />;
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
                <DropDownMenu value={queryname} onChange={(event, index, value) => this.props.history.push(value)}>
                    {initmenuitem}
                    {this.props.pluginList.map(function (val) {
                        return (<MenuItem value={val.name} primaryText={val.name} />
                        );
                    })}
                </DropDownMenu>
                <QueryForm queryType={querytype} />
            </div>
        );
    }
}

Query.propTypes = {
    match: {
        params: {
            queryType: PropTypes.string   
        }
    }
};

var QueryState = function(state){
    return {
        pluginList: state.pluginList
    }   
};

Query = connect(QueryState, null)(Query);
export default Query;

