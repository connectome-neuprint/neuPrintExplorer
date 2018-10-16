/*
 * Formatted table field for ranked table.
*/

import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export default class RankCell extends React.Component {
    render() {
        return (
            <div style={{backgroundColor: this.props.color, padding: "1em", minWidth: "100px"}}>
                <Typography>{this.props.name}</Typography>
                <Typography>{this.props.weight}</Typography>
                <Typography variant="caption">{this.props.reverse}</Typography>
            </div>
        );
    }
}

RankCell.propTypes = {
    color: PropTypes.string.isRequired,
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    weight: PropTypes.number.isRequired,
    reverse: PropTypes.number.isRequired,
};
