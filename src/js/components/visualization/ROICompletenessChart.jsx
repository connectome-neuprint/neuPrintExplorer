import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function createDataTable(dataSet, roiInfo) {
  const data = roiInfo.data.map(roi => {
    const [name, roipre, roipost, totalpre, totalpost] = roi;
    const postComplete = Math.round((roipost * 100) / totalpost);
    const preComplete = Math.round((roipre * 100) / totalpre);
    return {
      name,
      '% post complete': postComplete,
      '% pre complete': preComplete,
      order: postComplete
    }
  }).sort((a,b) => b.order - a.order);
  return (
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="% post complete" fill="#82ca9d" />
    </BarChart>
  );
}

function ROICompletenessChart(props) {
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

ROICompletenessChart.propTypes = {
  dataSet: PropTypes.string.isRequired
};

export default ROICompletenessChart;
