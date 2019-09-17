import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function createDataTable(dataSet, roiInfo) {
  // sort by highest to lowest % complete
  // TODO: filter out any ROI that isn't at the super level.
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
    <ResponsiveContainer width="100%" height={500} >
      <BarChart
        width={400}
        height={500}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <YAxis type="category" dataKey="name" />
        <XAxis type="number" />
        <Tooltip isAnimationActive={false} />
        <Legend />
        <Bar dataKey="% post complete" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ROICompletenessChart(props) {
  const { dataSet, superROIsByDataSet, actions } = props;

  const superROIs = superROIsByDataSet[dataSet];

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

        // filter out non super level ROIS
        const filtered = resp
        filtered.data = resp.data.filter(roi => superROIs.includes(roi[0]));
        setRoiInfo(filtered);
      })
      .catch(error => {
        actions.metaInfoError(error);
      });
  }, [dataSet]);

  if (roiInfo) {
    return createDataTable(dataSet, roiInfo);
  }
  return <p>loading</p>;
}

ROICompletenessChart.propTypes = {
  dataSet: PropTypes.string.isRequired,
  superROIsByDataSet: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default ROICompletenessChart;
