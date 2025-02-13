import Immutable from 'immutable';
import { setQueryString, getQueryObject } from 'helpers/queryString';
import C from './constants';

const neuroglancerState = Immutable.Map({
  display: false,
  neurons: Immutable.Map({}),
  layers: Immutable.Map({}),
  coordinates: Immutable.List([]),
  loading: false,
  error: null,
});

/* Neuron structure should be:
 * {
 *   name: <string>
 *   visible: <boolean>
 * }
 */


export default function neuroglancerReducer(state = neuroglancerState, action) {
  switch (action.type) {
    case C.NEUROGLANCER_ADD_ID: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      let selectedIndex = -1;
      let selected = null;
      let ftab = null;

      // find existing neuroglancer tab
      current.forEach((tab, index) => {
        if (tab.code === 'ng') {
          if (tab.ds === action.dataSet) {
            selectedIndex = index;
            selected = tab;
          }
        }
      });

      //   if dataSet is the same
      if (selectedIndex > 0) {
        const bodyIds = selected.pm.bodyIds.toString().split(',');
        // push the id into the bodyids list
        bodyIds.push(action.id);
        selected.pm.bodyIds = bodyIds.join(',');
        current[selectedIndex] = selected;
        if (!action.tabIndex) {
          ftab = selectedIndex;
        }
      } else {
        // if none found, then add one to the querystring
        //   push the id into the bodyids list
        // set the tab value to that of the skeleton viewer.
        current.push({
          code: 'ng',
          ds: action.dataSet,
          pm: {
            dataset: action.dataSet,
            bodyIds: action.id
          }
        });
        ftab = current.length - 1;
        // the SetQueryString function is turned off so that it doesn't immediately
        // shift the user to the neuroglancer tab. This can be turned back on if
        // the desired behavior changes.
        /* setQueryString({
          tab: current.length - 1,
        }); */
      }

      const newQuery = {
        qr: current
      };

      if (ftab) {
        const useSkeleton = JSON.parse(localStorage.getItem('use_skeleton'));
        if (!useSkeleton) {
          newQuery.ftab = ftab;
        }
      }

      setQueryString(newQuery);

      return state;
    }
    default: {
      return state;
    }
  }
}
