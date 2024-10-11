import { connect } from 'react-redux';
import { metaInfoError } from 'plugins/support';

import ConnectivityHeatMap from 'components/visualization/ConnectivityHeatMap';

const ConnectivityHeatMapState = () => ({});

const ConnectivityHeatMapDispatch = dispatch => ({
  actions: {
    metaInfoError: error => {
      dispatch(metaInfoError(error));
    }
  }
});

export default connect(
  ConnectivityHeatMapState,
  ConnectivityHeatMapDispatch
)(ConnectivityHeatMap);
