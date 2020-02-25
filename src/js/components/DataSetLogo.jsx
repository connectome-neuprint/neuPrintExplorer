import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  wrapper: {
    position: 'relative',
    height: '150px',
    display: 'table-cell'
  },
  title: {
    width: '100%',
    background: 'hsla(0, 0%, 0%, 0.5)',
    padding: '0.3em 1em',
    color: 'hsl(0, 0%, 100%)',
    position: 'absolute',
    bottom: 0,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%'
  }
});

function DataSetLogo(props) {
  const [imgUrl, setImageUrl] = useState(null);

  const { dataSet, classes, datasetInfo } = props;
  const altText = `data set logo for ${dataSet}`;

  useEffect(() => {
    fetch('/api/custom/custom?np_explorer=dataset_logo', {
      credentials: 'include',
      body: JSON.stringify({ cypher: `MATCH (m :Meta) RETURN m.logo` }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(result => result.json())
      .then(resp => {
        if (!('message' in resp)) {
          if (resp.data && resp.data[0]) {
            setImageUrl(resp.data[0][0]);
          }
        }
      })
      .catch(() => {
        setImageUrl(null);
      });
  }, []);

  let linkUrl = '';
  if (datasetInfo && Object.prototype.hasOwnProperty.call(datasetInfo, dataSet)) {
    linkUrl = datasetInfo[dataSet].info;
  }

  if (imgUrl) {
    return (
      <div className={classes.wrapper}>
        <p className={classes.title}>Data set: {dataSet}</p>
        <a href={linkUrl}>
          <img className={classes.image} src={imgUrl} alt={altText} />
        </a>
      </div>
    );
  }
  return React.Fragment;
}

DataSetLogo.propTypes = {
  dataSet: PropTypes.string.isRequired,
  datasetInfo: PropTypes.object.isRequired
};

export default withStyles(styles)(DataSetLogo);
