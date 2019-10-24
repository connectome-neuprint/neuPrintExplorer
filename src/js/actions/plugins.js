import isEqual from 'react-fast-compare';
import clone from 'clone';
import C from '../reducers/constants';

export function pluginResponseError(error) {
  return {
    type: C.PLUGIN_RESPONSE_ERROR,
    error: `PLUGIN RESPONSE ERROR: ${error}`
  };
}

export function updateQuery(index, newQueryObject) {
  return {
    type: C.UPDATE_QUERY,
    index,
    queryObject: newQueryObject
  };
}

export function formError(error, tabIndex=0) {
  return {
    type: C.PLUGIN_SUBMIT_ERROR,
    error,
    tabIndex
  };
}

function fetchingData(tab) {
  return {
    type: C.PLUGIN_SUBMITTING,
    tab
  };
}

function dataLoaded(response, params, tabIndex, label) {
  return {
    type: C.PLUGIN_SAVE_RESPONSE,
    response,
    params,
    tabIndex,
    label
  };
}

function dataLoadFailed(error, tabIndex=0) {
  return {
    type: C.PLUGIN_SUBMIT_ERROR,
    error,
    tabIndex
  };
}

function cacheHit() {
  return {
    type: C.PLUGIN_CACHE_HIT
  };
}

export function fetchData(params, plugin, tabPosition, token) {
  return function fetchDataAsync(dispatch, getState) {
    // we need to clone this object so that it doesn't modify the stored
    // parameters. This is important when checking for cached results.
    const parameters = clone(params.pm);

    const cached = getState().results.getIn(['allResults', tabPosition]);
    const label = (cached && cached.label) ? cached.label : `${tabPosition} - ${plugin.details.displayName}`;

    // Some plugins have nothing to fetch. In that case we can skip the remote fetch
    // and just return the query.
    if (parameters.skip) {
      const data = {};
      dispatch(dataLoaded(data, params, tabPosition, label));
      return Promise.resolve();
    }

    // cache lookup step that checks either Redux store
    // or localStorage to see if we have already fetched the results.
    // closing a tab needs to remove the cached values.
    if (cached) {
      // Ignore visProps when checking parameters, since that is
      // allowed to change, without triggering a data refresh.
      const cachedCopy = clone(cached.params);
      const currentCopy = clone(params);
      if (cachedCopy) {
        delete cachedCopy.visProps;
        delete cachedCopy.result;
      }
      if (currentCopy) {
        delete currentCopy.visProps;
        delete currentCopy.result;
      }
      if (isEqual(cachedCopy, currentCopy)) {
        dispatch(cacheHit());
        return Promise.resolve();
      }
    }

    if (!plugin) {
      return Promise.resolve();
    }

    dispatch(fetchingData(tabPosition));

    const fetchParams = plugin.fetchParameters(parameters, token);
    // build the query url. Use the custom one by default.
    let queryUrl = fetchParams.queryUrl || '/api/custom/custom';
    if (fetchParams.queryString) {
      queryUrl = `/api${fetchParams.queryString}`;
    }

    // if cypherQuery is passed in, then add it to the parameters.
    if (parameters.cypherQuery) {
      parameters.cypher = parameters.cypherQuery;
    } else if (fetchParams.cypherQuery) {
      parameters.cypher = fetchParams.cypherQuery;
    }

    const body = (fetchParams.method === 'GET') ? null : JSON.stringify(parameters);

    const querySettings = fetchParams.querySettings || {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body,
      method: fetchParams.method || 'POST',
      credentials: 'include'
    };

    return fetch(queryUrl, querySettings)
      .then(result => result.json())
      .then(resp => {
        // sends error message provided by neuprinthttp
        if (resp.error) {
          throw new Error(resp.error);
        }
        dispatch(dataLoaded(resp, params, tabPosition, label));
      })
      .catch(error => {
        dispatch(dataLoadFailed(error, tabPosition));
      });
  }
}

export function clearResultsCache() {
  return {
    type: C.CLEAR_CACHE
  };
}
