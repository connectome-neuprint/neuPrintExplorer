import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@mui/styles/withStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReactMarkdown from 'react-markdown';
import { Controlled as CodeMirror } from 'react-codemirror2';
import copy from 'copy-to-clipboard';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/markdown/markdown';

const styles = (theme) => ({
  card: {
    display: 'flex',
    minHeight: 200,
  },
  media: {
    width: 300,
    minWidth: 300,
    minHeight: 300,
    flexShrink: 0,
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    margin: '1rem'
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
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
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
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1)
  },
  editControls: {
    display: 'flex',
    gap: theme.spacing(0.5)
  },
  editor: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    '& .CodeMirror': {
      height: 'auto',
      minHeight: '100px',
      maxHeight: '300px'
    }
  }
});

function DataSetLogo(props) {
  const { dataSet, classes, datasetInfo, userInfo } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const isAdmin = userInfo?.AuthLevel === 'admin';

  const altText = `data set logo for ${dataSet}`;

  const currentDatasetInfo = datasetInfo && datasetInfo[dataSet] ? datasetInfo[dataSet] : {};
  console.log('Current Dataset Info:', currentDatasetInfo);
  const { info: linkUrl, description, logo } = currentDatasetInfo;

  const handleEditStart = () => {
    setEditedDescription(description || '');
    setIsEditing(true);
    setShowPreview(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedDescription('');
    setShowPreview(false);
  };

  const handleCopyToClipboard = () => {
    copy(editedDescription);
    console.log('Copied markdown to clipboard');
    // Optionally show a toast notification here
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

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

  return (
    <Card className={classes.card}>
      {logo ? (
        <CardMedia
          className={classes.media}
          image={logo}
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
        <div className={classes.headerContainer}>
          <Typography variant="h6" component="h2" className={classes.title}>
            {dataSet}
          </Typography>
          {isAdmin && !isEditing ? (
            <Tooltip title="Edit description">
              <IconButton size="small" onClick={handleEditStart}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {isAdmin && isEditing ? (
            <div className={classes.editControls}>
              <Tooltip title="Toggle preview">
                <IconButton size="small" onClick={togglePreview}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy markdown to clipboard">
                <IconButton size="small" onClick={handleCopyToClipboard}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel editing">
                <IconButton size="small" onClick={handleEditCancel}>
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <div>
            {showPreview ? (
              <div className={classes.description}>
                {renderDescription(editedDescription)}
              </div>
            ) : (
              <div className={classes.editor}>
                <CodeMirror
                  value={editedDescription}
                  options={{
                    mode: 'markdown',
                    theme: 'material',
                    lineNumbers: true,
                    lineWrapping: true,
                    viewportMargin: Infinity
                  }}
                  onBeforeChange={(editor, data, value) => {
                    setEditedDescription(value);
                  }}
                />
              </div>
            )}
          </div>
        ) : description ? (
          <div className={classes.description}>
            {renderDescription(description)}
          </div>
        ) : null}

      </CardContent>
    </Card>
  );
}

DataSetLogo.propTypes = {
  dataSet: PropTypes.string.isRequired,
  datasetInfo: PropTypes.object.isRequired,
  userInfo: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  userInfo: state.user.get('userInfo')
});

export default withStyles(styles)(connect(mapStateToProps)(DataSetLogo));
