/*
 * Debug pop-up for neuron text fields.
*/

"use strict";
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import PropTypes from 'prop-types';

const styles = () => ({
    badge: {
        right: "-10px",
        width: "100px",
        height: "50px",
        top: "-10px",
    }
});

class NeuronHelp extends React.Component {
    render() {
        const { classes } = this.props;

        var tooltip = (
            <Tooltip id="tooltip-icon"
                    title={this.props.text}
                    placement="top"
            >
                <Typography color="error"
                            variant="body1"
                >?</Typography>
            </Tooltip>
        );
        return (
            <Badge classes={{badge: classes.badge}}
                    color="default"
                    badgeContent={tooltip}
            >
                {this.props.children}
            </Badge>
        );
    }
}

NeuronHelp.propTypes = {
    children: PropTypes.element.isRequired,
    classes: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
}

NeuronHelp.defaultProps = {
    text: "Enter body ID, neuron name, or wildcard names using period+star (e.g., MBON.*)"
};


export default withStyles(styles)(NeuronHelp);
