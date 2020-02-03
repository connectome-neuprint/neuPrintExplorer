import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { getQueryObject } from 'helpers/queryString';
import qs from 'qs';

export default function Workstation(props) {
  // build the search string based on the props passed in.

  const { availableDatasets } = props;

  const { dataset, bodyid, tab = 0, ftab = 1 } = getQueryObject();

  // Can't do the redirect unless we have a dataset provided or a default loaded.
  if (!dataset && availableDatasets.length === 0) {
    return (
      <p>loading</p>
    );
  }

  const defaultDataset = availableDatasets.sort()[0];

  // set up the two tabs, one for the skeleton and one for the find neurons tab.
  const redirectQuery = {
    q: 0,
    tab,
    ftab,
    dataset: dataset || defaultDataset,
    qr: [
      {
        code: 'fn',
        ds: dataset || defaultDataset,
        pm: {
          all_segment: false,
          dataset: dataset || defaultDataset,
          neuron_id: bodyid
        }
      },
      {
        code: 'sk',
        ds: dataset || defaultDataset,
        pm: {
          bodyIds: bodyid,
          dataset: dataset || defaultDataset,
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

Workstation.propTypes = {
  availableDatasets: PropTypes.arrayOf(PropTypes.string).isRequired
};
