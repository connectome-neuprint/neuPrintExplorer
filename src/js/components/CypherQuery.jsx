import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import { launchNotification } from 'actions/app';
import C from '../reducers/constants';

const styles = {
  card: {
    width: 'auto',
    margin: '1em',
    overflow: 'visible',
  },
  code: {
     whiteSpace: 'pre-wrap'
  }
};

function CypherQuery(props) {
  const { cypherString, classes, actions } = props;

  const handleClose = (e) => {
    e.preventDefault();
    actions.closeCypher();
  }

  const handleCopy = () => {
    actions.launchNotification('Text Copied to Clipboard');
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <CardHeader
          title="Neo4j Cypher Query"
          action={
            <IconButton aria-label="Close" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <pre className={classes.code}>
          <CopyToClipboard
            text={cypherString}
            onCopy={handleCopy}
          >
            <span>{cypherString}</span>
          </CopyToClipboard>
        </pre>
      </CardContent>
    </Card>
  );
}

CypherQuery.propTypes = {
  cypherString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

const CypherQueryDispatch = dispatch => ({
  actions: {
    closeCypher: () => {
      dispatch({
        type: C.TOGGLE_CYPHER_DISPLAY
      });
    },
    launchNotification(message) {
      dispatch(launchNotification(message));
    },
  }
});

const CypherQueryState = () => ({});

export default withStyles(styles)(
  connect(
    CypherQueryState,
    CypherQueryDispatch
  )(CypherQuery)
);
