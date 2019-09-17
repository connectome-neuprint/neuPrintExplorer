import { connect } from 'react-redux';
import { metaInfoError } from '@neuprint/support';

import ROICompletenessChart from 'components/visualization/ROICompletenessChart';

const ROICompletenessChartState = state => ({
  superROIsByDataSet: state.neo4jsettings.get('superROIs')
});

const ROICompletenessChartDispatch = dispatch => ({
  actions: {
    metaInfoError: error => {
      dispatch(metaInfoError(error));
    },
  }
});

export default connect(
  ROICompletenessChartState,
  ROICompletenessChartDispatch
)(ROICompletenessChart);
