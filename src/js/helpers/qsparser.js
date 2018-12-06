import qs from 'qs';

// component should call when component is constructed
export function LoadQueryString(compName, compState, urlqs) {
    let newState = {}
    const querystr = qs.parse(urlqs);
    if (compName in querystr) {
        // could copy values that are no longer used
        newState = querystr[compName];
    }
    return Object.assign({}, compState, newState);
}

// component should call when state is updated
export function SaveQueryString(compName, compState) {
    const querystr = qs.parse(window.location.search.substring(1));
    querystr[compName] = compState;
    window.history.replaceState(null, null, `${window.location.pathname  }?${  qs.stringify(querystr)}`);
    return window.location.search.substring(1);
}

// remove query string values from object
export function RemoveQueryString(compName) {
    const querystr = qs.parse(window.location.search.substring(1));
    if (compName in querystr) {
        delete querystr[compName];
    }
    window.history.replaceState(null, null, `${window.location.pathname  }?${  qs.stringify(querystr)}`);
    return window.location.search.substring(1);
}


