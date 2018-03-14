/*
 * Handle neo4j server information.
*/

"use strict";

import React from 'React';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import SettingsIcon from 'material-ui-icons/Settings';
import IconButton from 'material-ui/IconButton';
import Warning from 'material-ui-icons/Warning';

import sessionJSON from '../../resources/sessiondefaults.json';

import {withStyles} from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';


const styles = theme => ({
    buttonAlign: {
    }
});


class NeoServer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            neoServer: sessionJSON.neo4jserver,
            open: false
        };
    }

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleSave = () => {
        alert(this.state.neoServer);
        this.setState({ open: false });
        this.props.setNeoServer(this.state.neoServer);
    };

    render () {
        const { classes } = this.props;
        var defaultserver = sessionJSON.neo4jserver;
        if (this.props.neoServer !== "") {
            defaultserver = this.props.neoServer;
        }

        //<Button className={classes.buttonAlign} color="inherit" onClick={this.handleClickOpen}>Connect</Button>
        return (
            <div>
                <IconButton aria-label="Settings" onClick={this.handleClickOpen}>
                    {this.props.neoServer === "" ? 
                        <Warning color="error"/> : <div />
                    }
                    <SettingsIcon color="secondary" />
                </IconButton>
                <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        Neo4j Connection Settings
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Server"
                            defaultValue={defaultserver}
                            onChange={(event) => this.setState({neoServer: event.target.value})}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleSave} color="primary">
                            Save 
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

var NeoServerState = function(state) {
    return {
        neoServer: state.neoServer,
    }
}

var NeoServerDispatch = function(dispatch) {
    return {
        setNeoServer: function(servername) {
            dispatch({
                type: 'SET_NEO_SERVER',
                neoServer: servername
            });
        }
    }
}

export default withStyles(styles)(connect(NeoServerState, NeoServerDispatch)(NeoServer));

