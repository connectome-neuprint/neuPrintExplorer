import React from 'react';
import PropTypes from 'prop-types';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

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
      <Card>
        <CardHeader
          title={<Typography variant="body1">Brain Region Connectivity</Typography>}
          className="homeCardHeader"
        />
        <CardContent>
          <ConnectivityPopOver contents={popover} target={target} />
          <ConnectivityHeatMap
            dataSet={dataSet}
            mouseOver={this.mouseOverHandler}
            mouseOut={this.mouseOutHandler}
          />
        </CardContent>
      </Card>
    );
  }
}

Connectivity.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default Connectivity;
