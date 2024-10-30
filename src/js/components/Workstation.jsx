import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router';
import { getQueryObject } from 'helpers/queryString';
import qs from 'qs';

/* Workstation - converts a cell type or body id and a dataset into a
 * result view. This is used to allow other sites to link to results
 * in neuprint without having to post the complicated search parameters.
 * This does mean that it is not very customized, but should be good
 * enough as a generic starting point. */

// live examples
// https://neuprint.janelia.org/view?dataset=hemibrain:v1.1&type=ER1_a
// https://neuprint.janelia.org/view?dataset=hemibrain:v1.1&bodyid=1291103485

// Dev examples
// https://neuprint-dev.janelia.org:11000/view?dataset=hemibrain:v1.1&type=ER1_a
// https://neuprint-dev.janelia.org:11000/view?dataset=hemibrain:v1.1&bodyid=1291103485


const itemsOnPage = 25;

export default function Workstation(props) {
  // build the search string based on the props passed in.

  const { availableDatasets } = props;

  const { dataset, type, bodyid, tab = 0, ftab = 1 } = getQueryObject();

  const [bodyIds, setBodyIds] = useState(null);

  const lookupBodyIds = async (name, ds) => {
    const queryUrl = `/api/npexplorer/findneurons`;
    const body = JSON.stringify({
      all_segment: false,
      dataset: ds,
      enable_contains: true,
      neuron_name: name
    });
    const querySettings = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body,
      method: 'POST',
      credentials: 'include'
    };
    const resp = await fetch(queryUrl, querySettings)
    const result = await resp.json();
    const ids = result.data.map(item => item[0]).slice(0,itemsOnPage);
    setBodyIds(ids);
  }

  useEffect(() => {
    if (type) {
      lookupBodyIds(type, dataset);
    } else {
      setBodyIds([bodyid]);
    }
  }, [type, bodyid, dataset]);

  // Can't do the redirect unless we have a dataset provided or a default loaded.
  if (!dataset && availableDatasets.length === 0) {
    return <p>loading</p>;
  }

  if (!bodyIds) {
    return <p>loading...</p>;
  }

  const defaultDataset = availableDatasets.sort()[0];

  let findNeuronsQuery = {};

  if (type) {
    findNeuronsQuery = {
      code: 'fn',
      ds: dataset || defaultDataset,
      pm: {
        all_segment: false,
        dataset: dataset || defaultDataset,
        enable_contains: true,
        neuron_name: type
      },
      visProps: {
        rowsPerPage: itemsOnPage
      }
    };
  } else if (bodyid) {
    findNeuronsQuery = {
      code: 'fn',
      ds: dataset || defaultDataset,
      pm: {
        all_segment: false,
        dataset: dataset || defaultDataset,
        neuron_id: bodyid
      }
    };
  }

  // set up the two tabs, one for the skeleton and one for the find neurons tab.
  const redirectQuery = {
    q: 0,
    tab,
    ftab,
    dataset: dataset || defaultDataset,
    qr: [
      findNeuronsQuery,
      {
        code: 'ng',
        ds: dataset || defaultDataset,
        pm: {
          bodyIds,
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
