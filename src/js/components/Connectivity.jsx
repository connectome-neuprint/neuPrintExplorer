import React from 'react';
import PropTypes from 'prop-types';

import ConnectivityHeatMap from 'containers/visualization/ConnectivityHeatMap';
import ConnectivityPopOver from 'components/visualization/ConnectivityPopOver';

class Connectivity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popover: null,
      target: null
    };
  }

  mouseOverHandler = (event, target) => {
    this.setState({ popover: event, target });
  };

  mouseOutHandler = () => {
    this.setState({ popover: null, target: null });
  };

  render() {
    const { dataSet } = this.props;
    const { popover, target } = this.state;
    return (
      <React.Fragment>
        <ConnectivityPopOver contents={popover} target={target} />
        <ConnectivityHeatMap
          dataSet={dataSet}
          mouseOver={this.mouseOverHandler}
          mouseOut={this.mouseOutHandler}
        />
      </React.Fragment>
    );
  }
}

Connectivity.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default Connectivity;
