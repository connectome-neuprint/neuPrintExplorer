/*
 * Handle neo4j server information.
*/

"use strict";

import React from 'React';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class NeoServer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            textValue: ""
        };
    }

    render () {
        return (
            <div>
                <TextField 
                    label="neo4j server"
                    onChange={(event) => this.setState({textValue: event.target.value})}
                />
                <Button
                    variant="raised"
                    onClick={() => this.props.setNeoServer(this.state.textValue)}
                >
                    Submit
                </Button>
            </div>
        );
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

export default connect(null, NeoServerDispatch)(NeoServer);

