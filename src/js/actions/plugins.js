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

const handleError = (response, dispatch) => {
  if (!response.ok) {
    dispatch(submissionError('Error processing query'));
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

    // if cypherQuery is passed in, then add it to the parameters.
    if (query.cypherQuery) {
      query.parameters.cypher = query.cypherQuery;
    }

    // async action here to fetch the results and format them.
    fetch(queryUrl, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(query.parameters),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => handleError(result, dispatch))
      .then(result => result.json())
      .then(resp => {
        // make new result object
        let data = query.processResults(query, resp);
        const combined = Object.assign(query, { result: data });
        dispatch(saveQueryResponse(combined));
      })
      .catch(function(error) {
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
