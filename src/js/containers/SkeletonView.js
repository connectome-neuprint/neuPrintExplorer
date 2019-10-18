import { connect } from 'react-redux';
import { skeletonRemove, toggleSpindle, toggleSynapsesOnTop  } from 'actions/skeleton';
import { getQueryObject, setQueryString } from 'helpers/queryString';

import SkeletonView from '../components/SkeletonView';

const SkeletonViewState = state => ({
  synapses: state.skeleton.get('synapses')
});

const SkeletonViewDispatch = dispatch => ({
  actions: {
    getQueryObject: (id, empty) => getQueryObject(id, empty),
    setQueryString: data => setQueryString(data),
    skeletonRemove: (id, dataSet, tabIndex) => {
      dispatch(skeletonRemove(id, dataSet, tabIndex));
    },
    toggleSpindle: (tabIndex) => {
      dispatch(toggleSpindle(tabIndex));
    },
    toggleSynapsesOnTop: (tabIndex) => {
      dispatch(toggleSynapsesOnTop(tabIndex))
    }
  }
});

export default connect(
  SkeletonViewState,
  SkeletonViewDispatch,
)(SkeletonView);
