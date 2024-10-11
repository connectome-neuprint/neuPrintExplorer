import React from 'react';
import PropTypes from 'prop-types';
import Skeleton from '@neuprint/react-skeleton';

export default function SkeletonFormatter(props) {
  const { rawData } = props;
  const swc = {};

  rawData.forEach(row => {
    swc[parseInt(row[0], 10)] = {
      x: parseInt(row[1], 10),
      y: parseInt(row[2], 10),
      z: parseInt(row[3], 10),
      radius: parseInt(row[4], 10),
      parent: parseInt(row[5], 10)
    };
  });

  return <Skeleton swc={swc} />;
}

SkeletonFormatter.propTypes = {
  rawData: PropTypes.arrayOf(PropTypes.array).isRequired
};
