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

    findCurrentPlugin = () => {
        // find matching query type
        var CurrentQuery = this.props.pluginList[0];
        for (var i in this.props.pluginList) {
            if (this.props.pluginList[i].queryName === this.props.queryType) {
                CurrentQuery = this.props.pluginList[i];
                break;
            }
        }
        return CurrentQuery;
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isQuerying && 
            nextProps.isQuerying != this.props.isQuerying &&
            nextProps.neoResults !== null) {
            
            var CurrentQuery = this.findCurrentPlugin();
            var results = CurrentQuery.parseResults(nextProps.neoResults);
            this.props.updateData(results);
        }
    }

    render() {
        // assume the first query is the default
        var CurrentQuery = this.findCurrentPlugin();
        //alert(CurrentQuery.queryName);

        return (
            <div>
                <br />
                <CurrentQuery callback={this.submitQuery} disable={this.props.isQuerying} />
            </div>
        );
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
        },
        updateData: function(results) {
            dispatch({
                type: 'UPDATE_RESULTS',
                allTables: results
            });
        }
    }
}

export default connect(QueryFormState, QueryFormDispatch)(QueryForm);
