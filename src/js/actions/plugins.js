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
    error: `PLUGIN ERROR: ${error}`,
  };
}

function saveQueryResponse(combined) {
  return {
    type: C.PLUGIN_SAVE_RESPONSE,
    combined,
  };
}

export function submit(query) {
  return function submitAsync(dispatch) {
    dispatch(submittingQuery(query));
    // async action here to fetch the results and format them.
    // should ideally run a function passed in by the plugin.
    // eg: query.exec()
    fetch(`/api${query.queryString}`, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(query.parameters),
      method: 'POST',
      credentials: 'include'
    })
      .then(result => result.json())
      .then(resp => {
        if ('error' in resp) {
          throw resp.error;
        }
        // make new result object
        let data = query.processResults(query.dataSet, resp);
        const combined = Object.assign(query, {result: data});
        dispatch(saveQueryResponse(combined));
      })
      .catch(function(error) {
        dispatch(submissionError(error));
      });
  };
}
