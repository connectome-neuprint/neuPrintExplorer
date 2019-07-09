import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';

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
  const { cypherString, classes } = props;
  return (
    <Card className={classes.card}>
      <CardContent>
        <CardHeader title="Neo4j Cypher Query" />
        <pre className={classes.code}>{cypherString}</pre>;
      </CardContent>
    </Card>
  );
}

CypherQuery.propTypes = {
  cypherString: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CypherQuery);
