/*
 * Main page holding query selector and query forms.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import QueryForm from "./QueryForm.react";
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';

class Query extends React.Component {
    render() {
        var queryname = "Select Query";
        var initmenuitem = (<MenuItem
                            value={queryname}
                            primaryText={queryname}
                           />);
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
                <DropDownMenu
                    value={queryname}
                    onChange={(event, index, value) => 
                        queryname === value ? 0 :this.props.history.push(value)}
                >
                    {initmenuitem}
                    {this.props.pluginList.map(function (val) {
                        return (<MenuItem
                                    key={val.name}
                                    value={val.name}
                                    primaryText={val.name} 
                                />
                        );
                    })}
                </DropDownMenu>
                <QueryForm queryType={querytype} />
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

