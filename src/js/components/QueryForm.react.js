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

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isQuerying && 
            nextProps.isQuerying != this.props.isQuerying &&
            nextProps.neoResults !== null) {
            
            var CurrentQuery = this.findCurrentPlugin();
            var results = CurrentQuery.parseResults(nextProps.neoResults);
            this.props.updateData(results);
        }
    }

    submitQuery = (query) => {
        if (this.props.neoServer === "") {
            this.setState({openSnack: true});
            return;
        }
        if (query === "") {
            return;
        }
       
        //this.setState({redirectResults: true})
        this.props.history.push("/results" + window.location.search);
        //(<Redirect to={{ pathname: '/', state: { from: this.props.location }}} />) : 
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
    neoQuery: PropTypes.string.isRequired, 
    neoServer: PropTypes.string.isRequired, 
    updateQuery: PropTypes.func.isRequired, 
    updateData: PropTypes.func.isRequired, 
    pluginList: PropTypes.array.isRequired,
    datasetstr: PropTypes.string.isRequired,
    isQuerying: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    neoResults: PropTypes.object,
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

export default withRouter(withStyles(styles)(connect(QueryFormState, QueryFormDispatch)(QueryForm)));

