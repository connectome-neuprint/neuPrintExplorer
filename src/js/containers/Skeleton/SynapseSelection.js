import { connect } from 'react-redux';
import SynapseUpdater from 'components/Skeleton/SynapseUpdater';
import { loadSynapse, removeSynapse, updateSynapseColor } from 'actions/skeleton';

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
    },
    updateSynapseColor: (bodyId, synapseId, options) => {
      dispatch(updateSynapseColor(bodyId, synapseId, options));
    }
  }
});

export default connect(
  SynapseSelectionState,
  SynapseSelectionDispatch
)(SynapseUpdater);
