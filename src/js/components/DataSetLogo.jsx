import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

const styles = (theme) => ({
  card: {
    margin: theme.spacing(1),
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
    overflow: 'auto'
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

  // Function to parse and render description content (JSON or markdown with links)
  const renderDescription = (desc) => {
    if (!desc) return null;

    try {
      // Try to parse as JSON first
      const jsonData = JSON.parse(desc);
      if (jsonData.text) {
        return renderTextWithLinks(jsonData.text);
      }
      return renderTextWithLinks(JSON.stringify(jsonData, null, 2));
    } catch {
      // If not JSON, treat as markdown/plain text with link parsing
      return renderTextWithLinks(desc);
    }
  };

  // Function to render text with embedded links
  const renderTextWithLinks = (text) => {
    // Simple markdown link pattern: [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkPattern.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the link
      parts.push(
        <Link
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
        >
          {match[1]}
        </Link>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
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
          <Typography variant="body2" className={classes.description}>
            {renderDescription(displayDescription)}
          </Typography>
        ) : null}

        <Box className={classes.linkContainer}>
          {linkUrl ? (
            <Link
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
            >
              More Information
            </Link>
          ) : null}
        </Box>
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
