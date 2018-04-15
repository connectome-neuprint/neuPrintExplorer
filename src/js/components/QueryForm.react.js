/*
 * Query form that calls specific plugins for form input an doutput processing.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
//import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import { withStyles } from 'material-ui/styles';


const styles = theme => ({
    divider: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
    }
});

class QueryForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openSnack: false,
            //redirectResults: false
        };
    }

    submitQuery = (query) => {
        if (this.props.neoServer === "") {
            this.setState({openSnack: true});
            return;
        }
        if (query.queryStr === "") {
            return;
        }
        /*
        assert("queryStr" in query);
        assert("callback" in query);
        assert("state" in query);
        */

        this.props.history.push("/results" + window.location.search);

        // flush all other results
        query["isChild"] = false;
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

    render() {
        // assume the first query is the default
        var CurrentQuery = this.findCurrentPlugin();
        const { classes } = this.props;

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
                <Typography variant="body1">{CurrentQuery.queryDescription}</Typography>
                <Divider className={classes.divider} />
                <CurrentQuery
                                datasetstr={this.props.datasetstr}
                                callback={this.submitQuery}
                                disable={this.props.isQuerying}
                />
            </div>
        );
    }
}


QueryForm.defaultProps = {
    queryType: ""
};

QueryForm.propTypes = {
    queryType: PropTypes.string.isRequired, 
    neoServer: PropTypes.string.isRequired, 
    updateQuery: PropTypes.func.isRequired, 
    pluginList: PropTypes.array.isRequired,
    datasetstr: PropTypes.string.isRequired,
    isQuerying: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    neoResults: PropTypes.object,
};


var QueryFormState = function(state){
    return {
        pluginList: state.app.pluginList,
        isQuerying: state.query.isQuerying,
        neoResults: state.query.neoResults,
        neoError: state.query.neoError,
        neoServer: state.neo4jsettings.neoServer
    }   
};

var QueryFormDispatch = function(dispatch) {
    return {
        updateQuery: function(query) {
            dispatch({
                type: 'UPDATE_QUERY',
                neoQueryObj: query
            });
        }
    }
}

export default withRouter(withStyles(styles)(connect(QueryFormState, QueryFormDispatch)(QueryForm)));

