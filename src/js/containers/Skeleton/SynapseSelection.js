import { connect } from 'react-redux';
import SynapseSelection from 'components/Skeleton/SynapseSelection';
import { loadSynapse, removeSynapse } from 'actions/skeleton';

const SynapseSelectionState = state => ({
  synapseState: state.skeleton.get('synapses')
});

const SynapseSelectionDispatch = dispatch => ({
  actions: {
    loadSynapse : (bodyId, synapseId, dataSet, options) => {
      dispatch(loadSynapse(bodyId, synapseId, dataSet, options));
    },
    removeSynapse : (bodyId, synapseId, isInput) => {
      dispatch(removeSynapse(bodyId, synapseId, isInput));
    }
  }
});

export default connect(
  SynapseSelectionState,
  SynapseSelectionDispatch
)(SynapseSelection);
