/*
 * Main page holding query selector and query forms.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import QueryForm from "./QueryForm.react";

// list of all plugin options
// TODO automatically set
var search_plugins = ['', 'custom', 'conntable'];

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
        if (this.props.match.params.queryType !== "") {
            queryname = this.props.match.params.queryType;
        }
        
        return (
            <div>
                <div>
                    <button 
                        className="btn btn-outline-secondary dropdown-toggle" 
                        type="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        {queryname}
                    </button>
                    <div className="dropdown-menu">
                        {search_plugins.map(function (val) {
                            return (<a className="dropdown-item" href="#">
                                        <Link
                                            to="/{val}"
                                        >
                                        {val}
                                        </Link>
                                    </a>
                            );
                        })}
                    </div>
                </div>
                <QueryForm queryType={this.prop.match.params.queryType} />
            </div>
        )
    }
}

Query.propTypes = {
    match: {
        params: {
            queryType: PropTypes.string   
        }
    }
};
