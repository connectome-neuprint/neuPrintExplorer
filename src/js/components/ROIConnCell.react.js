/*
 * Formatted table field for ranked table.
*/

import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export default class ROIConnCell extends React.Component {
    render() {
        return (
            <div style={{backgroundColor: this.props.color, padding: "1em", minWidth: "100px"}}>
                <Typography variant="body1">{this.props.weight}</Typography>
                <Typography variant="caption">{this.props.count}</Typography>
            </div>
        );
    }
}

ROIConnCell.propTypes = {
    color: PropTypes.string.isRequired,
    weight: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
};
