/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';
import Fade from 'material-ui/transitions/Fade';
import { CircularProgress } from 'material-ui/Progress';
import { connect } from 'react-redux';
import SimpleTables from './SimpleTables.react';
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import _ from "underscore";
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  align: {
    paddingTop: theme.spacing.unit*2,
  }
});

class Results extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            bookmarkname: "",
            showQuery: false
        }
    }

    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state));
    }

    handleClose = () => {
        this.setState({open: false});
    }

    openPopup = () => {
        this.setState({open: true, bookmarkname: ""});
    }

    downloadFile = () => {
        var csvdata = "";
        this.props.allTables.map( (tableinfo) => {
            // load one table -- fixed width
            
            // load table name
            var numelements = tableinfo.header.length;
            csvdata = csvdata + tableinfo.name + ",";
            for (var i = 1; i < numelements; i++) {
                csvdata = csvdata + ",";
            }
            csvdata = csvdata + "\n";

            // load headers
            tableinfo.header.map( (headinfo) => {
                csvdata = csvdata + headinfo + ",";
            });
            csvdata = csvdata + "\n";

            // load data
            tableinfo.body.map( (rowinfo) => {
                rowinfo.map( (elinfo) => {
                    csvdata = csvdata + JSON.stringify(elinfo) + ",";
                });
                csvdata = csvdata + "\n";
            });
        });

        var element = document.createElement("a");
        var file = new Blob([csvdata], {type: 'text/csv'});
        element.href = URL.createObjectURL(file);
        element.download = "results.csv";
        element.click();
    }

    addFavorite = () => {
        if (this.props.userInfo !== null) {
            var googleToken = this.props.userInfo["Zi"]["id_token"];
            var loc = window.location.pathname + window.location.search;
            this.setState({open: false});

            return fetch("/favoritesdb", {
                body: JSON.stringify({"name": this.state.bookmarkname, "url": loc, "cypher": this.props.cypher}),
                headers: {
                    'Authorization': googleToken,
                    'content-type': 'application/json'
                },
                method: 'POST',
            })
                .then((resp) => {
                    if (resp.status === 401) {
                        // need to re-authenticate
                        this.props.reAuth();
                        alert("User must re-authenticate");
                    }
                });
        }
    }

    render() {
        // TODO: show query runtime results
        const { classes } = this.props; 

        return (
            <div>
                <Grid 
                        container 
                        spacing={24}
                >
                    <Grid 
                            item
                            xs={8}
                            className={classes.align}
                    >
                    <Typography variant="title">Query Results</Typography>
                    </Grid>
                    { (this.props.userInfo !== null && this.props.allTables !== null) ? (
                        <Grid 
                                item 
                                xs={2}
                        >
                        <Button
                                className={classes.button}
                                variant="raised"
                                color="primary"
                                onClick={this.openPopup}
                        >
                            Bookmark
                            <Icon>star</Icon>
                        </Button>
                        <Dialog
                                open={this.state.open}
                                onClose={this.handleClose}
                                aria-labelledby="form-dialog-title"
                        >
                            <DialogTitle id="form-dialog-title">Save Bookmark</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                Name and save a query.
                                </DialogContentText>
                                <TextField
                                            autoFocus
                                            margin="dense"
                                            id="name"
                                            label="bookmark name"
                                            fullWidth
                                            onChange={(event) => this.setState({bookmarkname: event.target.value})}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button
                                        onClick={this.handleClose}
                                        color="primary">
                                    Cancel
                                </Button>
                                <Button 
                                        onClick={this.addFavorite}
                                        color="primary">
                                    Save
                                </Button>
                            </DialogActions>
                        </Dialog>
                        </Grid>
                      ) : (
                        <div />
                      )
                    }
                    { (this.props.allTables !== null) ? (
                        <Grid 
                                item 
                                xs={2}
                        >
                        <IconButton
                                    color="primary"
                                    className={classes.button}
                                    aria-label="Download data"
                                    onClick={this.downloadFile}
                        >
                            <Icon>file_download</Icon>
                        </IconButton>

                        </Grid>

                    ) : (
                        <div />
                    )
                    }
                </Grid> 

                <Divider />
                <Fade
                    in={this.props.isQuerying}
                    style={{
                        transitionDelay: this.props.isQuerying ? '800ms' : '0ms',
                    }}
                    unmountOnExit
                >
                    <CircularProgress />
                </Fade>
                { ((this.props.neoError !== null) || (this.props.allTables !== null)) ?
                    ( 
                        <div>
                        <Button
                                onClick={() => { this.setState({showQuery: !this.state.showQuery}) }}
                                color="primary"
                        >
                            { this.state.showQuery ? "Hide Query" : "Show Query" }
                        </Button>
                        { (this.state.showQuery) ? 
                            (
                                <Typography variant="body1">{this.props.cypher}</Typography>
                            ) :
                            (<div />)
                        }
                        </div>
                    )  :
                    (<div />)
                }
                { (this.props.neoError !== null) ? 
                    (<Typography>Error: {this.props.neoError.code}</Typography>) :
                    (this.props.allTables !== null ?
                        (
                            <div>
                                <SimpleTables allTables={this.props.allTables} />
                            </div>
                        ) : 
                        (<div />)
                    )
                }
            </div>
        );
    }
}

Results.propTypes = {
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    allTables: PropTypes.array,
    cypher: PropTypes.string.isRequired, 
    reAuth: PropTypes.func.isRequired, 
    neoError: PropTypes.object,
    isQuerying: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
    userInfo: PropTypes.shape({
        Zi: PropTypes.shape({
            id_token: PropTypes.string
        })
    }),
};




// result data [{name: "table name", header: [headers...], body: [rows...]
var ResultsState = function(state){
    return {
        isQuerying: state.query.isQuerying,
        neoError: state.query.neoError,
        allTables: state.results.allTables,
        userInfo: state.user.userInfo,
        cypher: state.query.neoQuery,
    }   
};

var ResultsDispatch = function(dispatch) {
   return {
        reAuth: function() {
            dispatch({
                type: 'LOGOUT_USER'
            });
        }
   }
}

export default withStyles(styles)(connect(ResultsState, ResultsDispatch)(Results));
