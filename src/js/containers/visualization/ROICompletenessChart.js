import { connect } from 'react-redux';

import ROICompletenessChart from 'components/visualization/ROICompletenessChart';

const ROICompletenessChartState = state => ({
  superROIsByDataSet: state.neo4jsettings.get('superROIs')
});

const ROICompletenessChartDispatch = () => ({
  actions: {
  }
});

export default connect(
  ROICompletenessChartState,
  ROICompletenessChartDispatch
)(ROICompletenessChart);
