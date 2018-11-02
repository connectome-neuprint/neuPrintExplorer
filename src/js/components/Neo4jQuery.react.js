/*
 * Non visual class to handle neo4j queries.
*/

//TODO: convert this class into a redux thunk.
// There should be no reason to have a React component
// just to load in content. 

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import NeuPrintResult from '../helpers/NeuPrintResult';
import { setQueryError, appendData, saveData, finishQuery } from '../actions/neoQuery';

var UNIQUE_ID = 0;

class Neo4jQuery extends React.Component {
  componentWillReceiveProps(nextProps) {
    // start query if query state changed
    if (nextProps.isQuerying) {
      // only authorized users could get server information
      if (nextProps.neoQueryObj.queryStr !== '' && nextProps.neoServer !== '') {
        // run query (TODO: handle blocking query??)
        const { setQueryError, saveData, appendData } = this.props;
        const processResults = nextProps.neoQueryObj.callback;
        let { queryStr, params, state } = nextProps.neoQueryObj;
        let uniqueId = UNIQUE_ID++;
        let endpoint = '/api';
        if (params !== undefined) {
          endpoint += queryStr;
        } else {
          endpoint += '/custom/custom';
          params = { cypher: queryStr };
        }

        fetch(endpoint, {
          headers: {
            'content-type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(params),
          method: 'POST',
          credentials: 'include'
        })
          .then(result => result.json())
          .then(resp => {
            if ('error' in resp) {
              throw resp.error;
            }
            // make new result object
            let result = new NeuPrintResult(resp);
            let data = processResults(result, state, uniqueId);
            if (data !== null && data.length > 0) {
              data[0]['queryStr'] = queryStr;
              for (let i = 0; i < data.length; i++) {
                data[i]['uniqueId'] = uniqueId;
              }
            }
            if (nextProps.neoQueryObj.isChild) {
              appendData(data);
            } else {
              saveData(data);
            }
          })
          .catch(function(error) {
            alert(error.message);
            setQueryError(error);
          });
      }
    }
  }

  render() {
    return null;
  }
}

var Neo4jQueryState = function(state) {
  return {
    neoQueryObj: state.query.neoQueryObj,
    isQuerying: state.query.isQuerying,
    neoServer: state.neo4jsettings.neoServer
  };
};

var Neo4jQueryDispatch = function(dispatch) {
  return {
    setQueryError: function(error) {
      dispatch(setQueryError(error));
    },
    appendData: function(results) {
      dispatch(appendData(results));
      dispatch(finishQuery());
    },
    saveData: function(results) {
      dispatch(saveData(results));
      dispatch(finishQuery());
    },
  };
};

Neo4jQuery.propTypes = {
  neoQueryObj: PropTypes.shape({
    queryStr: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired,
    state: PropTypes.object.isRequred,
    isChild: PropTypes.bool,
    params: PropTypes.object
  }),
  neoServer: PropTypes.string.isRequired,
  appendData: PropTypes.func.isRequired,
  saveData: PropTypes.func.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  setQueryError: PropTypes.func.isRequired,
};

export default connect(
  Neo4jQueryState,
  Neo4jQueryDispatch
)(Neo4jQuery);
