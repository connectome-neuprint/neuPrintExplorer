/*
 * Non visual class to handle neo4j queries.
*/

//TODO: convert this class into a redux thunk.
// There should be no reason to have a React component
// just to load in content. 

import C from '../reducers/constants';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import NeuPrintResult from '../helpers/NeuPrintResult';

var UNIQUE_ID = 0;

class Neo4jQuery extends React.Component {
  componentWillReceiveProps(nextProps) {
    // start query if query state changed
    if (nextProps.isQuerying) {
      // only authorized users could get server information
      if (nextProps.neoQueryObj.queryStr !== '' && nextProps.neoServer !== '') {
        // run query (TODO: handle blocking query??)
        let setError = this.props.setQueryError;
        let processResults = nextProps.neoQueryObj.callback;
        let state = nextProps.neoQueryObj.state;
        let saveData = this.props.saveData;
        let uniqueId = UNIQUE_ID++;
        if (nextProps.neoQueryObj.isChild) {
          saveData = this.props.appendData;
        }
        let queryStr = nextProps.neoQueryObj.queryStr;
        let endpoint = '/api';
        let params = nextProps.neoQueryObj.params;
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
            saveData(data);
          })
          .catch(function(error) {
            alert(error);
            setError(error);
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
      dispatch({
        type: C.SET_NEO_ERROR,
        neoError: error
      });
    },
    appendData: function(results) {
      dispatch({
        type: C.APPEND_RESULTS,
        allTables: results
      });
      dispatch({
        type: C.FINISH_QUERY
      });
    },
    saveData: function(results) {
      dispatch({
        type: C.UPDATE_RESULTS,
        allTables: results
      });
      dispatch({
        type: C.FINISH_QUERY
      });
    }
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
  setQueryError: PropTypes.func.isRequired
};

export default connect(
  Neo4jQueryState,
  Neo4jQueryDispatch
)(Neo4jQuery);
