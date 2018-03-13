/*
 * Supports simple, custom neo4j query.
*/

"use strict"

import React from 'react';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import { FormControl } from 'material-ui/Form';
import PropTypes from 'prop-types';

export default class FreeForm extends React.Component {
    static get name() {
        return "Custom";
    }

    constructor(props) {
        super(props);
        this.state = {
            textValue: ""
        };
    }

    processRequest = (event) => {
        this.props.callback(this.state.textValue);
    }

    render() {
        return (<FormControl>
                    <TextField 
                        label="Custom Cypher Query"
                        multiline
                        rows={1}
                        rowsMax={4}
                        onChange={(event) => this.setState({textValue: event.target.value})}
                    />
                    {this.props.disable ?
                        (
                            <Button
                                variant="raised"
                                onClick={this.processRequest}
                                disabled
                            >
                                Submit
                            </Button>
                        ) :
                        (
                            <Button
                                variant="raised"
                                onClick={this.processRequest}
                            >
                                Submit
                            </Button>
                        )
                    }
                </FormControl>
        );
    }
}

FreeForm.propTypes = {
    callback: PropTypes.func,
    disable: PropTypes.bool
};


