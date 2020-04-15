import { connect } from 'react-redux';
import {
  skeletonRemove,
  toggleSpindle,
  toggleSynapsesOnTop,
  setSynapseRadius
} from 'actions/skeleton';
import { logoutUser } from 'actions/user';
import { getQueryObject, setQueryString } from 'helpers/queryString';
import { metaInfoError } from '@neuprint/support';

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
    toggleSpindle: tabIndex => {
      dispatch(toggleSpindle(tabIndex));
    },
    toggleSynapsesOnTop: tabIndex => {
      dispatch(toggleSynapsesOnTop(tabIndex));
    },
    setSynapseRadius: (radius, tabIndex) => {
      dispatch(setSynapseRadius(radius, tabIndex));
    },
    metaInfoError: error => {
      dispatch(metaInfoError(error));
    },
    logoutUser: () => {
      dispatch(logoutUser());
    }
  }
});

export default connect(SkeletonViewState, SkeletonViewDispatch)(SkeletonView);
