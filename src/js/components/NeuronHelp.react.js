/*
 * Debug pop-up for neuron text fields.
*/

import React from 'react';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = () => ({
  badge: {
    position: 'absolute',
    top: '6px',
    right: '-10px',
    width: '2em',
    height: '2em',
  }
});

class NeuronHelp extends React.Component {
  render() {
    const { classes } = this.props;

    var tooltip = (
      <Tooltip id="tooltip-icon" title={this.props.text} placement="top">
        <Typography color="error" className={classes.badge} >
          ?
        </Typography>
      </Tooltip>
    );
    return (
      <div>
        {this.props.children}
        {tooltip}
      </div>
    );
  }
}

NeuronHelp.propTypes = {
  children: PropTypes.element.isRequired,
  classes: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired
};

NeuronHelp.defaultProps = {
  text: 'Enter body ID, neuron name, or wildcard names using period+star (e.g., MBON.*)'
};

export default withStyles(styles)(NeuronHelp);
