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
    height: '2em'
  }
});

const NeuronHelp = props => {
  const { classes, children, text } = props;

  const tooltip = (
    <Tooltip id="tooltip-icon" title={text} placement="top">
      <Typography color="error" className={classes.badge}>
        ?
      </Typography>
    </Tooltip>
  );
  return (
    <div>
      {children}
      {tooltip}
    </div>
  );
};

NeuronHelp.propTypes = {
  children: PropTypes.element.isRequired,
  classes: PropTypes.object.isRequired,
  text: PropTypes.string
};

NeuronHelp.defaultProps = {
  text:
    'Enter body ID, neuron name, or wildcard names using period+star (e.g., MBON.*). Warning: if using regular expressions, special characters like parentheses must be escaped (e.g. Delta6g\\\\(preQ7\\\\).*)'
};

export default withStyles(styles)(NeuronHelp);
