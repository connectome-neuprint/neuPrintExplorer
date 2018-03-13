/*
 * Query form that calls specific plugins for form input an doutput processing.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Fade from 'material-ui/transitions/Fade';
import { CircularProgress } from 'material-ui/Progress';


class QueryForm extends React.Component {
    submitQuery = (query) => {
        if (query === "") {
            return;
        }
        this.props.updateQuery(query);
    }

    render() {
        // assume the first query is the default
        var CurrentQuery = this.props.pluginList[0];

        // find matching query type
        for (var i in this.props.pluginList) {
            if (this.props.pluginList[i].name === this.props.QueryType) {
                CurrentQuery = this.props.pluginList[i];
                break;
            }
        }
        
        if (this.props.neoResults !== null) {
            this.props.neoResults.records.forEach(function (record) {
                alert(record.get('labelname'));
            });
        }
     
        return (
            <div>
                <br />
                <CurrentQuery callback={this.submitQuery} disable={this.props.isQuerying} />
            </div>
        );

        // ?! submitted query will be in redux store
            // ?! will make neo4j query and save result and status (potentially in a different file)
            // ?! raw results will be stored store plugin can handle
        

        // ?! parse table info basic -- over-ride in plugin how?? -- maybe just use functions??
    }
}


QueryForm.defaultProps = {
    queryType: ""
};

QueryForm.propTypes = {
    queryType: PropTypes.string, 
    neoQuery: PropTypes.string, 
    pluginList: PropTypes.array
};


var QueryFormState  = function(state){
    return {
        pluginList: state.pluginList,
        neoQuery: state.neoQuery,
        isQuerying: state.isQuerying,
        neoResults: state.neoResults,
        neoError: state.neoError
    }   
};

var QueryFormDispatch = function(dispatch) {
    return {
        updateQuery: function(query) {
            dispatch({
                type: 'UPDATE_QUERY',
                neoQuery: query
            });
        }
    }
}

export default connect(QueryFormState, QueryFormDispatch)(QueryForm);
