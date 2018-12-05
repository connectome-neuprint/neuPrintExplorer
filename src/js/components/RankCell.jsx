/*
 * Formatted table field for ranked table.
*/

import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const RankCell = ({color, name, weight, reverse}) => (
  <div style={{backgroundColor: color, padding: "1em", minWidth: "100px"}}>
    <Typography>{name}</Typography>
    <Typography>{weight}</Typography>
    <Typography variant="caption">{reverse}</Typography>
  </div>
);

RankCell.propTypes = {
    color: PropTypes.string.isRequired,
    name: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    weight: PropTypes.number.isRequired,
    reverse: PropTypes.number.isRequired,
};

export default RankCell;
