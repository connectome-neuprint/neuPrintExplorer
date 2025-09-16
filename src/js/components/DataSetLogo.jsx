import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';

const styles = (theme) => ({
  card: {
    display: 'flex',
    minHeight: 200,
  },
  media: {
    width: 200,
    minWidth: 200,
    flexShrink: 0,
    backgroundSize: 'contain',
    backgroundPosition: 'center'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    minWidth: 0,
    overflow: 'hidden'
  },
  title: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    wordWrap: 'break-word',
    overflowWrap: 'break-word'
  },
  description: {
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    flex: 1,
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    overflow: 'auto',
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    '& p': {
      margin: 0,
      marginBottom: theme.spacing(0.5)
    },
    '& p:last-child': {
      marginBottom: 0
    }
  },
  linkContainer: {
    marginTop: theme.spacing(1),
    flexShrink: 0
  }
});

function DataSetLogo(props) {
  const [imgUrl, setImageUrl] = useState(null);
  const [metaDescription, setMetaDescription] = useState(null);

  const { dataSet, classes, datasetInfo } = props;
  const altText = `data set logo for ${dataSet}`;

  useEffect(() => {
    fetch('/api/custom/custom?np_explorer=dataset_meta', {
      credentials: 'include',
      body: JSON.stringify({
        cypher: `MATCH (m :Meta) RETURN m.logo, m.description`,
        dataset: dataSet
      }),
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
            setMetaDescription(resp.data[0][1]);
          } else {
            setImageUrl(null);
            setMetaDescription(null);
          }
        }
      })
      .catch(() => {
        setImageUrl(null);
        setMetaDescription(null);
      });
  }, [dataSet]);

  const currentDatasetInfo = datasetInfo && datasetInfo[dataSet] ? datasetInfo[dataSet] : {};
  const { info: linkUrl, lastmod, uuid, description } = currentDatasetInfo;

  // Function to render description content as markdown
  const renderDescription = (desc) => {
    if (!desc) return null;

    // append the info link from linkUrl if available
    desc += linkUrl ? `\n\n[info]: ${linkUrl}` : '';

    return (
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
            >
              {children}
            </Link>
          )
        }}
      >
        {desc}
      </ReactMarkdown>
    );
  };

  // Use metaDescription from database first, fall back to datasetInfo description
  const displayDescription = metaDescription || description;

  return (
    <Card className={classes.card}>
      {imgUrl ? (
        <CardMedia
          className={classes.media}
          image={imgUrl}
          title={altText}
        />
      ) : (
        <Box
          className={classes.media}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="#f0f0f0"
        >
          <Typography variant="caption" color="textSecondary" align="center" padding={2}>
            {dataSet}
          </Typography>
        </Box>
      )}
      <CardContent className={classes.content}>
        <Typography variant="h6" component="h2" className={classes.title}>
          {dataSet}
        </Typography>

        {displayDescription ? (
          <div className={classes.description}>
            {renderDescription(displayDescription)}
          </div>
        ) : null}

      </CardContent>
    </Card>
  );
}

DataSetLogo.propTypes = {
  dataSet: PropTypes.string.isRequired,
  datasetInfo: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DataSetLogo);
