import React from 'react';
import PropTypes from 'prop-types';

class DataSetHome extends React.Component {
  render() {
    const { dataSet } = this.props;
    return (
      <div>
        <p>Home page for dataset {dataSet}</p>
      </div>
    );
  }
}

DataSetHome.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default DataSetHome;
