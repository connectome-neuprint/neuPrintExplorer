import React from 'react';
import { Redirect } from 'react-router';
import { getQueryObject } from 'helpers/queryString';
import qs from 'qs';

export default function Workstation() {
  // build the search string based on the props passed in.

  const { dataset = 'hemibrain', bodyid, tab = 1 } = getQueryObject();

  // set up the two tabs, one for the skeleton and one for the find neurons tab.
  const redirectQuery = {
    q: 0,
    tab,
    dataset,
    qr: [
      {
        code: 'fn',
        ds: dataset,
        pm: {
          all_segment: false,
          dataSet: dataset,
          neuron_id: bodyid
        }
      },
      {
        code: 'sk',
        ds: dataset,
        pm: {
          bodyIds: bodyid,
          dataSet: dataset,
          skip: true
        }
      }
    ]
  };

  const searchString = qs.stringify(redirectQuery);

  // TODO: There should be a common function to add/remove a tab, or any other search
  // string manipulation.
  return (
    <Redirect
      to={{
        pathname: '/results',
        search: searchString
      }}
    />
  );
}
