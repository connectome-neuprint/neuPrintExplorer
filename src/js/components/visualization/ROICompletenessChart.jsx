import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function createDataTable(dataSet, roiInfo) {
  // sort by highest to lowest % complete
  // TODO: filter out any ROI that isn't at the super level.
  const data = roiInfo.map(roi => {
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
        setRoiInfo(resp.data);
      })
      .catch(error => {
        actions.metaInfoError(error);
      });
  }, [dataSet]);

  if (roiInfo && superROIs) {
    // In some browsers the loading of the superROI data happens after the
    // loading of the ROICompleteness info. This causes a bug, because the data
    // is undefined. The fix is to store the data and only apply the filter
    // when the superROIs have loaded. This is annoying as the filter has to be
    // applied every time the component is loaded, but it is more reliable and
    // doesn't fail due to timing issues. Ideal fix would be to filter this on
    // the server
    const filtered = roiInfo.filter(roi => superROIs.includes(roi[0]));
    return createDataTable(dataSet, filtered);
  }
  return <p>loading</p>;
}

ROICompletenessChart.propTypes = {
  dataSet: PropTypes.string.isRequired,
  superROIsByDataSet: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default ROICompletenessChart;
