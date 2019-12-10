import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function DataSetLogo(props) {
  const [imgUrl, setImageUrl] = useState(null);

  const { dataSet } = props;
  const altText = `data set logo for ${dataSet}`;

  useEffect(() => {
    fetch('/api/custom/custom', {
      credentials: 'include',
      body: JSON.stringify({ cypher: `MATCH (m :${dataSet}_Meta) RETURN m.logo` }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(result => result.json())
      .then(resp => {
        if (!('message' in resp)) {
          setImageUrl(resp.data[0][0]);
        }
      });
  }, []);

  if (imgUrl) {
    return <img style={{ maxWidth: '100%' }} src={imgUrl} alt={altText} />;
  }
  return React.Fragment;
}

DataSetLogo.propTypes = {
  dataSet: PropTypes.string.isRequired
};
