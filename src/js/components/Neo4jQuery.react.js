/* 
 * Non visual class to handle neo4j queries.
*/

"use strict"

import C from "../reducers/constants"

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import neo4j from "neo4j-driver/lib/browser/neo4j-web";
var UNIQUE_ID = 0;

class Neo4jQuery extends React.Component {
    componentWillReceiveProps(nextProps) {
        // start query if query state changed
        if (nextProps.isQuerying) {
            if (nextProps.neoQueryObj.queryStr !== "" && nextProps.neoServer !== "") {
                // run query (TODO: handle blocking query??) 
                var session = driver.session();
                var setError = this.props.setQueryError;
                var processResults = nextProps.neoQueryObj.callback;
                var state = nextProps.neoQueryObj.state;
                let saveData = this.props.saveData;
                let uniqueId = UNIQUE_ID++;
                if (nextProps.neoQueryObj.isChild) {
                    saveData = this.props.appendData;
                }
                let queryStr = nextProps.neoQueryObj.queryStr;
                session
                    .run(queryStr)
                    .then(function (result) {
                        let data = processResults(result, state, uniqueId);
                        if (data !== null && data.length > 0) {
                            data[0]["queryStr"] = queryStr;
                            for (let i = 0; i < data.length; i++) {
                                data[i]["uniqueId"] = uniqueId;
                            }
                        }
                        saveData(data);
                        session.close();
                    })
                    .catch(function (error) {
                        alert(error);
                        setError(error);
                    });
            }
        }
    }
    
    render() {
        return null
    }
}

var Neo4jQueryState = function(state){
    return {
        neoQueryObj: state.query.neoQueryObj,
        isQuerying: state.query.isQuerying,
    }   
};

var Neo4jQueryDispatch = function(dispatch) {
    return {
        setQueryError: function(error) {
            dispatch({
                type: C.SET_NEO_ERROR,
                neoError: error
            });
        },
        appendData: function(results) {
            dispatch({
                type: C.APPEND_RESULTS,
                allTables: results
            });
            dispatch({
                type: C.FINISH_QUERY,
            });
        },
        saveData: function(results) {
            dispatch({
                type: C.UPDATE_RESULTS,
                allTables: results
            });
            dispatch({
                type: C.FINISH_QUERY,
            });
        }
    }
}

Neo4jQuery.propTypes = {
    neoQueryObj: PropTypes.shape({
        queryStr: PropTypes.string.isRequired,
        callback: PropTypes.func.isRequired,
        state: PropTypes.object.isRequred,
        isChild: PropTypes.bool
    }),
    appendData: PropTypes.func.isRequired, 
    saveData: PropTypes.func.isRequired, 
    isQuerying: PropTypes.bool.isRequired,
    setQueryError: PropTypes.func.isRequired,
};

export default connect(Neo4jQueryState, Neo4jQueryDispatch)(Neo4jQuery);
