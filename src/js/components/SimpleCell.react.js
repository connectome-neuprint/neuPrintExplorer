/*
 * Simple table cell wrapper for table info.
*/

"use strict";
import React from 'react';
import PropTypes from 'prop-types';
import { TableCell} from 'material-ui/Table';
import { withStyles } from 'material-ui/styles';

const styles = () => ({
  fcell: {
    height: "1px",
  },
});

class SimpleCell extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <TableCell
                        className={this.props.isSimple ? "": classes.fcell}
                        padding={this.props.isSimple ? "default" : "none"} 
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
    isSimple: PropTypes.bool
}

export default withStyles(styles)(SimpleCell);
