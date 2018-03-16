/*
 * Query form that calls specific plugins for form input an doutput processing.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Fade from 'material-ui/transitions/Fade';
import { CircularProgress } from 'material-ui/Progress';
import Snackbar from 'material-ui/Snackbar';

class QueryForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openSnack: false
        };
    }

    submitQuery = (query) => {
        if (this.props.neoServer === "") {
            this.setState({openSnack: true});
            return;
        }
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
    
    handleClose = () => {
        this.setState({openSnack: false});
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
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={this.state.openSnack}
                    onClose={this.handleClose}
                    SnackbarContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">Must initialize settings</span>}
                /> 
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
        neoError: state.neoError,
        neoServer: state.neoServer
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
