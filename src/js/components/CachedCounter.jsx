import React from 'react';
import PropTypes from 'prop-types';
import dateFns from 'date-fns';


class CachedCounter extends React.Component {
  constructor(props) {
    super(props);
    const { fetchedTime } = this.props;
    this.state = {
      distanceInWords: dateFns.distanceInWordsToNow(new Date(fetchedTime))
    };
  }

  componentDidMount() {
    this.updateTimeId = setInterval(() => {
      const { fetchedTime } = this.props;
      this.setState({distanceInWords: dateFns.distanceInWordsToNow(new Date(fetchedTime))});
    },  1000);
  }

  componentWillUnmount() {
    clearInterval(this.updateTimeID);
  }


  render() {
    const { distanceInWords } = this.state;
    return(<span>{distanceInWords}</span>);
  }
}

CachedCounter.propTypes = {
  fetchedTime: PropTypes.number.isRequired
};

export default CachedCounter;
