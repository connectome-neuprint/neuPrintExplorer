import Immutable from 'immutable';

const skeletonState = Immutable.Map({
  synapses: Immutable.Map({}),
});


export default function skeletonReducer(state = skeletonState, action) {
  switch (action.type) {
    case 'NOOP': {
      return state;
    }
    default: {
      return state;
    }
  }
}
