import React from 'react';
import PropTypes from 'prop-types';
import Connectivity from 'components/Connectivity';

function DataSetHome(props) {
  const { dataSet } = props;
  return (
    <Connectivity dataSet={dataSet} />
  );
}

DataSetHome.propTypes = {
  dataSet: PropTypes.string.isRequired,
};

export default DataSetHome;
