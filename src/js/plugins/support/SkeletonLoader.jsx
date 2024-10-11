import React from 'react';
import PropTypes from 'prop-types';
import SkeletonFormatter from './SkeletonFormatter';

class SkeletonLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rawData: null
    };
  }

  componentDidMount() {
    this.fetchSWC();
  }

  componentDidUpdate(prevProps) {
    const { bodyIds, dataSet } = this.props;
    if (prevProps.bodyIds !== bodyIds || prevProps.dataSet !== dataSet) {
      this.fetchSWC();
    }
  }

  fetchSWC() {
    const { bodyIds, dataSet, onError } = this.props;
    fetch(`/api/skeletons/skeleton/${dataSet}/${bodyIds[0]}`, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      method: 'GET',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(result => {
        if ('error' in result) {
          throw result.error;
        }
        this.setState({ rawData: result.data });
      })
      .catch(error => onError(error));
  }

  render() {
    const { bodyIds, dataSet } = this.props;
    const { rawData } = this.state;
    if (!rawData) {
      const loadingString = `Loading...${bodyIds[0]}, ${dataSet}`;
      return <p>{loadingString}</p>;
    }


    return <SkeletonFormatter rawData={rawData} />;
  }
}

SkeletonLoader.propTypes = {
  bodyIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  dataSet: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired
};

export default SkeletonLoader;
