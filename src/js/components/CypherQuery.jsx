import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
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

  function handleClose(e) {
    e.preventDefault();
    actions.closeCypher();
  }

  function handleCopy() {
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
