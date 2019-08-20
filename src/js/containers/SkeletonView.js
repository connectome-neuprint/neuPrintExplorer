import { connect } from 'react-redux';
import SkeletonView from '../components/SkeletonView';

const SkeletonViewState = state => ({
  synapses: state.skeleton.get('synapses')
});

export default connect(
  SkeletonViewState,
  null
)(SkeletonView);
