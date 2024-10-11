import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';

export default function RoiInfoTip(props) {
  const { roi, roiLookup } = props;

  let fullName = '';

  if (roiLookup[roi]) {
    fullName = roiLookup[roi].description;
  }

  return(
    <Tooltip title={fullName} placement="right"><span>{roi}</span></Tooltip>
  );
}

RoiInfoTip.propTypes = {
  roi: PropTypes.string.isRequired,
  roiLookup: PropTypes.object.isRequired,
};
