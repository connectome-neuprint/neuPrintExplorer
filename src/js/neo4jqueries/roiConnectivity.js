/*
 * Implements ROI connectivity query and table parser.
*/

import SimpleCellWrapper from '../helpers/SimpleCellWrapper';
import ROIConnCell from '../components/ROIConnCell.react';
import ClickableQuery from '../components/ClickableQuery.react';
import React from 'react';
import neuronsInROIs from './neuronsInROIs';

// default color for max connection
var WEIGHTCOLOR = '255,100,100,';

// TODO: add clickable links in the ROI table
// TODO: add pairwise distribution of inputs/outputs to roi table

// create ROI tables
var processResults = function(results, state, uniqueId) {
  let bodyin = {};
  let completerois = state.rois;

  // provides information for column and ROIs
  let allrois = new Set();

  // TODO: need a list of ROIs saved in the database or from selection

  // grab inputs for a body id
  results.records.forEach(function(record) {
    let bodyid = record.get('bodyid');
    let rois = JSON.parse(record.get('roiInfo'));

    for (let roi in rois) {
      if (completerois.includes(roi)) {
        allrois.add(roi);

        // add numpost to provide size distribution
        if (rois[roi].post > 0) {
          if (!(bodyid in bodyin)) {
            bodyin[bodyid] = [[roi, rois[roi].post]];
          } else {
            bodyin[bodyid].push([roi, rois[roi].post]);
          }
        }
      }
    }
  });

  let roiroires = {};
  let roiroicounts = {};
  let maxval = 1;

  // grab output and add table entry
  results.records.forEach(function(record) {
    let bodyid = record.get('bodyid');
    let rois = JSON.parse(record.get('roiInfo'));

    for (let currroi in rois) {
      if (completerois.includes(currroi)) {
        // create roi2roi based on input distribution
        let numpre = rois[currroi].pre;
        if (numpre > 0 && bodyid in bodyin) {
          let totalvalue = 0;
          for (let i = 0; i < bodyin[bodyid].length; i++) {
            totalvalue += bodyin[bodyid][i][1];
          }
          for (let i = 0; i < bodyin[bodyid].length; i++) {
            let roiin = bodyin[bodyid][i][0];
            if (roiin === '' || totalvalue === 0) {
              continue;
            }
            let value = (numpre * bodyin[bodyid][i][1] * 1.0) / totalvalue;
            let connname = roiin + '=>' + currroi;
            if (connname in roiroires) {
              roiroires[connname] += value;
              roiroicounts[connname] += 1;
            } else {
              roiroires[connname] = value;
              roiroicounts[connname] = 1;
            }
            let currval = roiroires[connname];
            if (currval > maxval) {
              maxval = currval;
            }
          }
        }
      }
    }
  });

  // make data table
  let index = 0;
  let data = [];

  let allrois2 = [];
  for (let roiname of allrois) {
    allrois2.push(roiname);
  }

  allrois2.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  for (let i = 0; i < allrois2.length; i++) {
    let roiname = allrois2[i];
    let data2 = [];
    data2.push(new SimpleCellWrapper(index++, roiname, true, null, uniqueId, 'white'));
    for (let j = 0; j < allrois2.length; j++) {
      let roiname2 = allrois2[j];
      let val = 0;
      let count = 0;
      let connname = roiname + '=>' + roiname2;
      if (connname in roiroires) {
        val = parseInt(roiroires[connname].toFixed());
        count = roiroicounts[connname];
      }

      let scalefactor = 0;
      if (val > 0) {
        scalefactor = Math.log(val) / Math.log(maxval);
      }
      let typecolor = 'rgba(' + WEIGHTCOLOR + scalefactor.toString() + ')';

      let query = neuronsInROIs([roiname], [roiname2], '', state.datasetstr, true);

      data2.push(
        new SimpleCellWrapper(
          index++,
          (
            <ClickableQuery neoQueryObj={query}>
              <ROIConnCell weight={val} count={count} color={typecolor} />
            </ClickableQuery>
          ),
          false,
          count
        )
      );
    }
    data.push(data2);
  }

  // return results
  let headerdata = [new SimpleCellWrapper(index++, '')];

  for (let i = 0; i < allrois2.length; i++) {
    let roiname = allrois2[i];
    headerdata.push(new SimpleCellWrapper(index++, roiname, true, null, -1, 'white'));
  }

  let tables = [];
  let table = {
    paginate: false,
    lockLeft: true,
    header: headerdata,
    body: data,
    name: 'ROI Connectivity (column: inputs, row: outputs)'
  };
  tables.push(table);
  return tables;
};

// creates query object and sends to callback
export default function(datasetstr, rois) {
  let query = {
    queryStr: '/npexplorer/roiconnectivity',
    params: { dataset: datasetstr },
    callback: processResults,
    state: {
      datasetstr: datasetstr,
      rois: rois
    }
  };
  return query;
}
