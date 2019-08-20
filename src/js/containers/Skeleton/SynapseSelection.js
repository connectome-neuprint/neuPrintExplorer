import { connect } from 'react-redux';
import SynapseSelection from 'components/Skeleton/SynapseSelection';
import { toggleSynapse } from 'actions/skeleton';

const SynapseSelectionState = state => ({
  synapseState: state.skeleton.get('synapses')
});

const SynapseSelectionDispatch = dispatch => ({
  actions: {
    toggleSynapse : (bodyId, synapseId, isInput) => {
      dispatch(toggleSynapse(bodyId, synapseId, isInput));
    }
  }
});

export default connect(
  SynapseSelectionState,
  SynapseSelectionDispatch
)(SynapseSelection);
