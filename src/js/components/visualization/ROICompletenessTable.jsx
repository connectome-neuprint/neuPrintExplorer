import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { SimpleTable } from '@neuprint/views';

function createDataTable(dataSet, roiInfo) {
  const query = {
    vizProps: {
      rowsPerPage: 20
    }
  };

  query.result = roiInfo;

  return <SimpleTable query={query} actions={{}} />;
}

function ROICompletenessTable(props) {
  const { dataSet } = props;

  const [roiInfo, setRoiInfo] = useState();

  useEffect(() => {
    const QueryUrl = `/api/cached/roicompleteness?dataset=${dataSet}`;
    const QueryParameters = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      method: 'GET',
      credentials: 'include'
    };

    fetch(QueryUrl, QueryParameters)
      .then(result => result.json())
      .then(resp => {
        if (resp.error) {
          throw new Error(resp.error);
        }
        setRoiInfo(resp);
      })
      .catch(error => {
        console.log(error);
      });
  }, [dataSet]);

  if (roiInfo) {
    return createDataTable(dataSet, roiInfo);
  }
  return <p>loading</p>;
}

ROICompletenessTable.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default ROICompletenessTable;
