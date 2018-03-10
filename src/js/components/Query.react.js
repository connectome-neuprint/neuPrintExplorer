/*
 * Main page holding query selector and query forms.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import QueryForm from "./QueryForm.react";
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';


// list of all plugin options
// TODO automatically set
var search_plugins = ['custom', 'conntable'];

export default class Query extends React.Component {
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
        if ("queryType" in this.props.match.params &&
            search_plugins.includes(this.props.match.params.queryType)) {
            queryname = this.props.match.params.queryType;
            querytype = queryname;
            initmenuitem = <div />
        }

        // TODO: fix default menu option (maybe make the custom query the default)
        return (
            <div>
                <DropDownMenu value={queryname} onChange={(event, index, value) => this.props.history.push(value)}>
                    {initmenuitem}
                    {search_plugins.map(function (val) {
                        return (<MenuItem value={val} primaryText={val} />
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
