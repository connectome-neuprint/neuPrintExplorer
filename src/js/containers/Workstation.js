import { connect } from 'react-redux';
import Workstation from '../components/Workstation';

const WorkstationState = state => ({
  availableDatasets: state.neo4jsettings.get('availableDatasets')
});

const WorkstationDispatch = () => ({
  actions: {}
});

export default connect(
  WorkstationState,
  WorkstationDispatch
)(Workstation);
