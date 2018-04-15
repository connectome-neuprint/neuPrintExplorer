/*
 * Top bar for each query result.
*/

"use strict";
import React from 'react';
import Typography from 'material-ui/Typography';
import { connect } from 'react-redux';
import Icon from 'material-ui/Icon';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Toolbar from 'material-ui/Toolbar';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import PropTypes from 'prop-types';

const styles = () => ({
    root: {
        width: "100%",
        flexGrow: true,
        backgroundColor: "rgba(0, 0, 0, 0.24)",
    },
    flex: {
        flex: 1,
    },
});

class ResultsTopBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            bookmarkname: "",
            showQuery: false
        }
    }
 
    
    openPopup = () => {
        this.setState({open: true, bookmarkname: ""});
    }

    handleClose = () => {
        this.setState({open: false});
    }

    addFavorite = () => {
        if (this.props.userInfo !== null) {
            var googleToken = this.props.userInfo["Zi"]["id_token"];
            var loc = window.location.pathname + window.location.search;
            this.setState({open: false});

            return fetch("/favoritesdb", {
                body: JSON.stringify({"name": this.state.bookmarkname, "url": loc, "cypher": this.props.queryStr}),
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
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Toolbar>
                    <Typography 
                                variant="caption"
                                color="inherit"
                                className={classes.flex}
                                noWrap
                    >
                        {this.props.name} 
                    </Typography>
                    <IconButton
                            onClick={() => { this.setState({showQuery: true}) }}
                            aria-label="Show Query"
                    >
                        <Icon style={{fontSize:18}}>info</Icon>
                    </IconButton>
                    <Dialog
                            open={this.state.showQuery}
                            onClose={() => { this.setState({showQuery: false}) }}
                            aria-labelledby="form-dialog-title"
                    >
                        <DialogTitle id="form-dialog-title">Neo4j Cypher Query</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                            {this.props.queryStr} 
                            </DialogContentText>
                        </DialogContent>
                    </Dialog>
                    <IconButton
                            aria-label="Add favorite"
                            onClick={this.openPopup}
                    >
                        <Icon style={{fontSize:18}}>star</Icon>
                    </IconButton>
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
                    <IconButton
                                className={classes.button}
                                aria-label="Download data"
                                onClick={this.props.downloadCallback}
                    >
                        <Icon style={{fontSize:18}}>file_download</Icon>
                    </IconButton>
                </Toolbar>
            </div>
        );
    }
}

var ResultsTopBarState = function(state) {
    return {
        userInfo: state.user.userInfo,
    }
}

var ResultsTopBarDispatch = function(dispatch) {
   return {
        reAuth: function() {
            dispatch({
                type: 'LOGOUT_USER'
            });
        }
   }
}

ResultsTopBar.propTypes = {
    classes: PropTypes.object.isRequired,
    reAuth: PropTypes.func.isRequired,
    downloadCallback: PropTypes.func.isRequired,
    queryStr: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    userInfo: PropTypes.shape({
        Zi: PropTypes.shape({
            id_token: PropTypes.string
        })
    }),
};

export default withStyles(styles)(connect(ResultsTopBarState, ResultsTopBarDispatch)(ResultsTopBar));
