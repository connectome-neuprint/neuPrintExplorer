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

export function formError(error) {
  return {
    type: C.PLUGIN_SUBMIT_ERROR,
    error
  };
}

function fetchingData(tab) {
  return {
    type: C.PLUGIN_SUBMITTING,
    tab
  };
}

function dataLoaded(response, tabIndex) {
  return {
    type: C.PLUGIN_SAVE_RESPONSE,
    response,
    tabIndex
  };
}

function dataLoadFailed(error) {
  return {
    type: C.PLUGIN_SUBMIT_ERROR,
    error
  };
}

function cacheHit() {
  return {
    type: C.PLUGIN_CACHE_HIT
  };
}

export function fetchData(params, plugin, tabPosition) {
  return function fetchDataAsync(dispatch, getState) {
    // TODO: add a cache lookup step that checks either Redux store
    // or localStorage to see if we have already fetched the results.
    // closing a tab needs to remove the cached values.
    const cached = getState().results.getIn(['allResults', tabPosition]);
    if (cached) {
      dispatch(cacheHit());
      return;
    }

    const { pm: parameters } = params;
    if (!plugin) {
      return;
    }

    dispatch(fetchingData(tabPosition));

    const fetchParams = plugin.fetchParameters(parameters);
    // build the query url. Use the custom one by default.
    let queryUrl = '/api/custom/custom';
    if (fetchParams.queryString) {
      queryUrl = `/api${fetchParams.queryString}`;
    }

    // if cypherQuery is passed in, then add it to the parameters.
    if (parameters.cypherQuery) {
      parameters.cypher = parameters.cypherQuery;
    } else if (fetchParams.cypherQuery) {
      parameters.cypher = fetchParams.cypherQuery;
    }
    // Some plugins have nothing to fetch. In that case we can skip the remote fetch
    // and just return the query.
    if (parameters.skip) {
      const data = {};
      dispatch(dataLoaded(data, tabPosition));
      return;
    }

    fetch(queryUrl, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(parameters),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(resp => {
        // sends error message provided by neuprinthttp
        if (resp.error) {
          throw new Error(resp.error);
        }
        // make new result object
        dispatch(dataLoaded(resp, tabPosition));
      })
      .catch(error => {
        dispatch(dataLoadFailed(error));
      });
  }
}
