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

export class QueryForm extends React.Component {
    static defaultProps = {
        queryType: ""
    }

    render() {
        if (this.props.queryType === "") {
            return <div />;
        } else {
            return <div> {this.props.queryType} </div>;
        }
    }
}

QueryForm.propTypes = {
    queryType: PropTypes.string   
};

// query form that houses specific query props; neo4j logic will go here
