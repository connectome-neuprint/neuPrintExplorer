import React from 'react';
import { RoiHeatMap, HeatMapLabels } from '@neuprint/miniroiheatmap';
import { MiniROIBarGraph} from '@neuprint/miniroibargraph';

function desc(a, b, orderBy) {
  let aVal = a[orderBy];
  let bVal = b[orderBy];

  // need to check if the cell has a value / action object
  if (aVal && typeof aVal === 'object') {
    if ('sortBy' in aVal) {
      aVal = aVal.sortBy;
    } else if ('value' in aVal) {
      aVal = aVal.value;
    }
  }

  if (bVal && typeof bVal === 'object') {
    if ('sortBy' in bVal) {
      bVal = bVal.sortBy;
    } else if ('value' in bVal) {
      bVal = bVal.value;
    }
  }

  // need to check for null values
  if (bVal === null) {
    return 1;
  }
  if (aVal === null) {
    return -1;
  }

  // now finish the sort
  if (bVal < aVal) {
    return -1;
  }
  if (bVal > aVal) {
    return 1;
  }
  return 0;
}

export function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

export function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

export function getCSRoiInfoObjectWithNoneCount(roiInfoObject, roiList, postTotal) {
  // deep copy roi info object
  const newRoiInfoObject = JSON.parse(JSON.stringify(roiInfoObject));

  // calculate # pre and post in super rois (which are disjoint) to get total
  // number of synapses assigned to an roi
  let postInSuperRois = 0;
  Object.keys(newRoiInfoObject).forEach(roi => {
    if (roiList.includes(roi)) {
      postInSuperRois += roiInfoObject[roi].post;
    }
  });

  // add this after the other rois have been summed.
  // records # pre and post that are not in rois
  newRoiInfoObject.None = {
    post: postTotal - postInSuperRois
  };

  return newRoiInfoObject;
}

export function getRoiHeatMapForConnection(
  csRoiInfoObject,
  roiList,
  connectionWeight,
  bodyIdA,
  bodyIdB
) {
  const csRoiInfoObjectWithNoneCount = getCSRoiInfoObjectWithNoneCount(
    csRoiInfoObject,
    roiList,
    connectionWeight // total number of psds for the connection is the weight of the connection
  );

  const styles = {
    display: 'flex',
    flexDirection: 'row',
    margin: '5px'
  };

  return (
    <div style={{ display: 'inline-flex' }}>
      <div style={{ display: 'block' }}>
        <b>Connection details</b>
        <div>{`${bodyIdA} to ${bodyIdB}`}</div>
      </div>
      <div style={{ display: 'block', paddingLeft: '30px' }}>
        <div key="labels" style={styles}>
          <HeatMapLabels roiList={roiList} />
        </div>
        <div key="post" style={styles}>
          <RoiHeatMap
            listOfRoisToUse={roiList}
            roiInfoObject={csRoiInfoObjectWithNoneCount}
            roiInfoObjectKey="post"
            sumOfValues={connectionWeight}
          />
        </div>
      </div>
    </div>
  );
}

export function getRoiBarChartForConnection(
  csRoiInfoObject,
  roiList,
  connectionWeight,
  bodyIdA,
  bodyIdB
) {
  /* const csRoiInfoObjectWithNoneCount = getCSRoiInfoObjectWithNoneCount(
    csRoiInfoObject,
    roiList,
    connectionWeight // total number of psds for the connection is the weight of the connection
  ); */

  // const postTotal = Object.values(csRoiInfoObject).reduce((total, current) => total + current.post, 0);
  // const preTotal = Object.values(csRoiInfoObject).reduce((total, current) => total + current.pre, 0);

  return (
    <div style={{ display: 'inline-flex' }}>
      <div style={{ display: 'block' }}>
        <b>Connection details</b>
        <div>{`${bodyIdA} to ${bodyIdB}`}</div>
      </div>
      <div style={{ display: 'block', paddingLeft: '30px' }}>
          <MiniROIBarGraph
            roiInfoObject={csRoiInfoObject}
            listOfRoisToUse={roiList}
            roiInfoObjectKey="post"
            sumOfValues={connectionWeight}
          />
      </div>
    </div>
  );
}


export default {
  stableSort,
  getSorting,
  getRoiHeatMapForConnection,
  getCSRoiInfoObjectWithNoneCount
};
