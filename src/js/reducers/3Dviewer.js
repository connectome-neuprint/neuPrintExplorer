import Immutable from 'immutable';
import { setQueryString, getQueryObject } from 'helpers/queryString';

import C from './constants';

const threeDviewerState = Immutable.Map({
  synapses: Immutable.Map({}),
});

function fTabIsNeuroglancerOrSkeleton() {
  const current = getQueryObject('qr', []);
  const currentFtabIndex = getQueryObject('ftab', null);
  const tab = current[currentFtabIndex];
  if (!tab) {
    return false;
  }
  return tab.code === 'ng' || tab.code === 'sk';
}

function addNeuronglancerToQuery(action, priorQuery) {
  // grab the tab data
  const current = (priorQuery && priorQuery.qr) ? priorQuery.qr : getQueryObject('qr', []);

  // need to find the index of the tab we are going to update / replace.
  let selectedIndex = -1;
  let ftab = null;

  // find existing neuroglancer tab
  current.forEach((tab, index) => {
    if (tab.code === 'ng') {
      if (tab.ds === action.dataSet) {
        selectedIndex = index;
      }
    }
  });

  //   if dataSet has a selected tab
  if (selectedIndex > 0) {
    ftab = selectedIndex;
  } else {
    // if none found, then add one to the querystring
    // and set the tab value to that of the skeleton viewer.
    current.push({
      code: 'ng',
      ds: action.dataSet,
      pm: {
        dataset: action.dataSet,
      },
    });
    ftab = current.length - 1;
  }

  const newQuery = {
    qr: current,
  };

  if (fTabIsNeuroglancerOrSkeleton()) {
    return newQuery;
  }

  if (ftab) {
    const useSkeleton = JSON.parse(localStorage.getItem('use_skeleton'));
    if (!useSkeleton) {
      newQuery.ftab = ftab;
    }
  }
  return newQuery;
}

function addBodiesToQuery(bodies, dataSet, tabIndex, options, priorQuery) {
  // grab the tab data
  const current = (priorQuery && priorQuery.qr) ? priorQuery.qr : getQueryObject('qr', []);

  // need to find the index of the tab we are going to update / replace.
  let selectedIndex = tabIndex || -1;
  let selected = current[tabIndex];
  let ftab = null;

  // find existing skeletonviewer tab
  current.forEach((tab, index) => {
    if (tab.code === 'sk') {
      if (tab.ds === dataSet) {
        selectedIndex = index;
        selected = tab;
      }
    }
  });

  //   if dataSet is the same
  if (selectedIndex >= 0) {
    let bodyIds = [];
    if (selected.pm.bodyIds) {
      bodyIds = selected.pm.bodyIds.toString().split(',');
    }
    // if we are replacing the body ids, then we need to clear out the old ones
    if (options && options.replace) {
      bodyIds = [];
    }
    // push the id into the bodyids list
    bodyIds.push(bodies.map(body => body.id));
    selected.pm.bodyIds = bodyIds.join(',');
    current[selectedIndex] = selected;
    if (!tabIndex) {
      ftab = selectedIndex;
    }
  } else {
    // if none found, then add one to the querystring
    //   push the id into the bodyids list
    // set the tab value to that of the skeleton viewer.
    current.push({
      code: 'sk',
      ds: dataSet,
      pm: {
        dataset: dataSet,
        skip: true,
        bodyIds: bodies.map(body => body.id)
      }
    });
    ftab = current.length - 1;
  }


  const newQuery = {
    qr: current
  };

  if (fTabIsNeuroglancerOrSkeleton()) {
    return newQuery;
  }

  if (ftab) {
    const useSkeleton = JSON.parse(localStorage.getItem('use_skeleton'));
    // if use has chosen to use skeleton as the default viewer, then set
    // the ftab to the skeleton viewer tab.
    if (useSkeleton) {
      newQuery.ftab = ftab;
    }
  }


  /*  // set the colors if provided
  const db = new PouchDB('neuprint_compartments');
  const colorModifiers = bodies.map(body => db.get(`sk_${body.id}`)
    .then(doc => {
      const updated = doc;
      // only add a record to pouch db if there is a defined color
      if (body.color) {
        updated.color = body.color;
        return db.put(updated);
      }
      return Promise.resolve();
    })
    .catch(() => {
      // only add a record to pouch db if there is a defined color
      if (body.color) {
        const record = {
          _id: `sk_${body.id}`,
          color: body.color,
        };
        db.put(record);
      }
    })
  );

  Promise.all(colorModifiers); */
  return newQuery;
}


function removeNeuroglancerBodies(tab, idToRemove) {
  if (!tab.pm.bodyIds) {
    const bodyIds = tab.pm.bodyIds.toString().split(',');
    const updated = bodyIds.filter((id) => id !== idToRemove);
    tab.pm.bodyIds = updated;
  }
  return tab;
}

function removeSkeletonBodies(tab, idToRemove) {
  const bodyIds = tab.pm.bodyIds.toString().split(',');
  const updated = bodyIds.filter((id) => id !== idToRemove);
  tab.pm.bodyIds = updated.join(',');
  return tab;
}

function removeBodiesFromQuery(action) {

  const idToRemove = action.id;


  const current = getQueryObject('qr', []);

  let ngTab = null;
  let skTab = null;

  current.forEach((tab, index) => {
    if (tab.code === 'ng') {
      ngTab = removeNeuroglancerBodies(tab, idToRemove);
      current[index] = ngTab;
    } else if (tab.code === 'sk') {
      skTab = removeSkeletonBodies(tab, idToRemove);
      current[index] = skTab;
    }
  });

  const newQuery = {
    qr: current
  };

  return newQuery;
}

function isNgTab() {
  const current = getQueryObject('qr', []);
  const currentFtabIndex = getQueryObject('ftab', null);
  const tab = current[currentFtabIndex];
  if (!tab) {
    return false;
  }
  return tab.code === 'ng';
}

export default function the3DviewerReducer(state = threeDviewerState, action) {
  switch (action.type) {
    case C.ADD_AND_OPEN_3D_VIEWER: {
      const newQuery = addNeuronglancerToQuery(action);
      // add the skeleton viewer tab to the query string
      const updateQuery = addBodiesToQuery(
        [{ id: action.id, color: action.color }],
        action.dataSet,
        action.tabIndex,
        undefined,
        newQuery
      );
      // crappy hack to get the ftab set if it was originally set in
      // the addBodiesToQuery function.
      if (newQuery.ftab) {
        updateQuery.ftab = newQuery.ftab;
      }
      // if updating an already open neuroglancer, then make sure the
      // url is updated via a window.history.replaceState()
      if (isNgTab()) {
        setQueryString(updateQuery, true);
      } else {
        setQueryString(updateQuery);
      }
      return state;
    }
    case C.REMOVE_BODY_FROM_3D_VIEWER: {
      const updated = removeBodiesFromQuery(action);
      if (isNgTab()) {
        setQueryString(updated, true);
      } else {
        setQueryString(updated);
      }
      return state;
    }
    case C.NEUROGLANCER_ADD_ID: {
      const newQuery = addNeuronglancerToQuery(action);
      setQueryString(newQuery);
      return state;
    }
    case C.SKELETON_ADD_ID: {
      const newQuery = addBodiesToQuery(
        [{ id: action.id, color: action.color }],
        action.dataSet,
        action.tabIndex
      );
      setQueryString(newQuery);
      return state;
    }
    case C.SKELETON_ADD_BODIES: {
      const newQuery = addBodiesToQuery(action.bodies, action.dataSet, action.tabIndex, action.options);
      setQueryString(newQuery);
      return state;
    }
    case C.SKELETON_CLEAR: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      let selectedIndex = action.tabIndex || -1;
      let selected = current[action.tabIndex];

      // find existing skeletonviewer tab
      current.forEach((tab, index) => {
        if (tab.code === 'sk') {
          if (tab.ds === action.dataSet) {
            selectedIndex = index;
            selected = tab;
          }
        }
      });

      //   if dataSet is the same clear out the bodies
      if (selectedIndex >= 0) {
        selected.pm.bodyIds = [];
        current[selectedIndex] = selected;
      }

      const newQuery = {
        qr: current,
      };

      setQueryString(newQuery);

      return state;
    }
    case C.SKELETON_REMOVE: {
      // grab the tab data
      const current = getQueryObject('qr', []);

      // need to find the index of the tab we are going to update / replace.
      const selected = current[action.tabIndex];

      if (selected) {
        const bodyIds = selected.pm.bodyIds.toString().split(',');
        // push the id into the bodyids list
        const updated = bodyIds.filter((id) => id !== action.id);
        selected.pm.bodyIds = updated.join(',');
        current[action.tabIndex] = selected;
        setQueryString({
          qr: current,
        });
      }
      return state;
    }
    case C.SKELETON_SYNAPSE_LOADED: {
      const updated = state.setIn(
        ['synapses', action.bodyId, action.synapseType, action.synapseId],
        { color: action.color, swc: action.data }
      );
      return updated;
    }
    case C.SKELETON_SYNAPSE_REMOVE: {
      const synapseType = action.isInput ? 'inputs' : 'outputs';
      const updated = state.deleteIn(['synapses', action.bodyId, synapseType, action.synapseId]);
      return updated;
    }
    case C.SKELETON_SPINDLE_TOGGLE: {
      // grab the tab data
      const query = getQueryObject();
      const current = query.qr || [];
      // const current = getQueryObject('qr', []);
      // need to find the index of the tab we are going to update / replace.
      const selected = current[action.tabIndex];

      if (selected) {
        // get current spindle display state
        const spindleState = parseInt(selected.sp, 10) || 0;
        selected.sp = !spindleState ? 1 : 0;
        current[action.tabIndex] = selected;
        setQueryString({
          qr: current,
        });
      }
      return state;
    }
    case C.AXIS_LINE_TOGGLE: {
      // grab the tab data
      const current = getQueryObject('qr', []);
      // need to find the index of the tab we are going to update / replace.
      const selected = current[action.tabIndex];

      if (selected) {
        // get current spindle display state
        const spindleState = parseInt(selected.ax, 10) || 0;
        selected.ax = !spindleState ? 1 : 0;
        current[action.tabIndex] = selected;
        setQueryString({
          qr: current,
        });
      }
      return state;
    }
    case C.SKELETON_SYNAPSE_COLOR_UPDATE: {
      const updated = state.setIn(
        ['synapses', action.bodyId, action.synapseType, action.synapseId, 'color'],
        action.color
      );
      return updated;
    }
    case C.SKELETON_SYNAPSES_ON_TOP_TOGGLE: {
      // grab the tab data
      const current = getQueryObject('qr', []);
      // need to find the index of the tab we are going to update / replace.
      const selected = current[action.tabIndex];

      if (selected) {
        // get current display state
        const synapsesOnTopState = parseInt(selected.sot, 10) || 0;
        selected.sot = !synapsesOnTopState ? 1 : 0;
        current[action.tabIndex] = selected;
        setQueryString({
          qr: current,
        });
      }
      return state;
    }
    default: {
      return state;
    }
  }
}
