/*
 * Query form that calls specific plugins for form input an doutput processing.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';

// ?! list of all plugin options -- or in Query?

// ?! call plugins for form data and to process output

// ?! basic neo4j calls for query

// ?! default a custom query

export default class QueryForm extends React.Component {
    static defaultProps = {
        queryType: ""
    }

    render() {
        if (this.props.queryType === "") {
            return <div />;
        } else {
            return <div> {this.props.queryType} </div>;

        }


        // ?! render widgets for query type -- how?? (how to call plugin, how to make simple so it doesn't have to worry about redux)
            // ?! prop could be callback for onclick submit
            // ?! just import all plugin and store in array -- could be done outside

        // ?! submitted query will be in redux store
            // ?! will make neo4j query and save result and status (potentially in a different file)
            // ?! raw results will be stored store plugin can handle
        

        // ?! parse table info basic -- over-ride in plugin how?? -- maybe just use functions??
    }
}

QueryForm.propTypes = {
    queryType: PropTypes.string   
};

// query form that houses specific query props; neo4j logic will go here
