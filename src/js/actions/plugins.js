import C from '../reducers/constants';

function submittingQuery(query) {
  return {
    type: C.PLUGIN_SUBMITTING,
    query
  };
}

function submissionError(error) {
  return {
    type: C.PLUGIN_SUBMIT_ERROR,
    error: `PLUGIN ERROR: ${error}`
  };
}

export function pluginResponseError(error) {
  return {
    type: C.PLUGIN_RESPONSE_ERROR,
    error: `PLUGIN RESPONSE ERROR: ${error}`
  };
}

function saveQueryResponse(combined) {
  return {
    type: C.PLUGIN_SAVE_RESPONSE,
    combined
  };
}

export function updateQuery(index, newQueryObject) {
  return {
    type: C.UPDATE_QUERY,
    index,
    queryObject: newQueryObject
  };
}

const handleError = response => {
  if (!response.ok) {
    if (response.status !== 400) {
      throw new Error(`Failed to process query. [Status Code: ${response.status}]`);
    }
  }
  return response;
};

export function submit(query) {
  return function submitAsync(dispatch) {
    dispatch(submittingQuery(query));

    // build the query url. Use the custom one by default.
    let queryUrl = '/api/custom/custom';
    if (query.queryString) {
      queryUrl = `/api${query.queryString}`;
    }

    const { parameters } = query;
    // if cypherQuery is passed in, then add it to the parameters.
    if (query.cypherQuery) {
      parameters.cypher = query.cypherQuery;
    }

    // async action here to fetch the results and format them.
    return fetch(queryUrl, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(parameters),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => handleError(result))
      .then(result => result.json())
      .then(resp => {
        // sends error message provided by neuprinthttp
        if (resp.error) {
          throw new Error(resp.error);
        }
        // make new result object
        const data = query.processResults(query, resp);
        const combined = Object.assign(query, { result: data });
        dispatch(saveQueryResponse(combined));
      })
      .catch(error => {
        dispatch(submissionError(error));
      });
  };
}

export function formError(error) {
  return {
    type: C.PLUGIN_SUBMIT_ERROR,
    error
  };
}
