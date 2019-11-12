import React from 'react';
import PropTypes from 'prop-types';
import dateFns from 'date-fns';


class CachedCounter extends React.Component {
  /* I can't see a way to get the setState on an unmounted component warning
   * to go away, by simply clearing the Interval in the componentWillUnmount
   * method. There are still cases when the setState function fires.
   * Therefore I added an isMountedNow test to ignore the set state, if it
   * fires before the interval gets cancelled. */
  isMountedNow = false;

  constructor(props) {
    super(props);
    const { fetchedTime } = this.props;
    this.state = {
      distanceInWords: dateFns.distanceInWordsToNow(new Date(fetchedTime))
    };
  }

  componentDidMount() {
    this.isMountedNow = true;
    this.updateTimeId = setInterval(() => {
      const { fetchedTime } = this.props;
      if (this.isMountedNow) {
        this.setState({distanceInWords: dateFns.distanceInWordsToNow(new Date(fetchedTime))});
      }
    },  1000);
  }

  componentWillUnmount() {
    this.isMountedNow = false;
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
