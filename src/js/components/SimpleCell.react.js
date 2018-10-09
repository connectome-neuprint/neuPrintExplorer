/*
 * Simple table cell wrapper for table info.
*/

'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { TableCell } from 'material-ui/Table';
import { withStyles } from 'material-ui/styles';

const styles = () => ({
  fcell: {
    height: '1px'
  },
  basic: {
    //backgroundColor: "white",
  }
});

class SimpleCell extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <TableCell
        className={
          (this.props.isSimple ? classes.basic : classes.fcell) +
          (this.props.lockVal > -1 ? ' lockLeft-' + this.props.lockVal.toString() : '')
        }
        padding={this.props.isSimple ? 'default' : 'none'}
        style={this.props.bgColor !== '' ? { background: this.props.bgColor } : {}}
      >
        {this.props.children}
      </TableCell>
    );
  }
}

SimpleCell.defaultProps = {
  isSimple: true
};

SimpleCell.propTypes = {
  children: PropTypes.any.isRequired,
  classes: PropTypes.object.isRequired,
  isSimple: PropTypes.bool.isRequired,
  lockVal: PropTypes.number.isRequired,
  bgColor: PropTypes.string.isRequired
};

export default withStyles(styles)(SimpleCell);
