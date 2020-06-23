import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => createStyles({
  centered: {
    textAlign: 'center'
  },
  notepaper: {
    margin: theme.spacing(2)
  }
}));

export default function ReleaseNotes() {
  const [releaseNotes, setReleaseNotes] = useState(null);
  const [loadingError, setLoadingError] = useState(false);
  const datasetInfo = useSelector(state => state.neo4jsettings.get('datasetInfo'));
  const classes = useStyles();

  // load release notes from server via fetch
  useEffect(() => {
    fetch('/public/datareleasenotes.json')
      .then(resp => resp.json())
      .then(data => setReleaseNotes(data))
      .catch(() => setLoadingError(true));
  }, []);

  if (loadingError) {
    return <p>Loading Error</p>;
  }

  if (!releaseNotes || !datasetInfo) {
    return <p>Loading...</p>;
  }

  const notesPerDataSet = Object.keys(datasetInfo).map(key => {
    const matchedDataSet = releaseNotes.filter(note => note.dataset === key);
    if (matchedDataSet.length > 0) {
      const formattedNotes = matchedDataSet[0].notes.map(note => <li key={note}>{note}</li>);

      return (
        <Grid key={key} item xs={12} className={classes.notepaper}>
          <Card>
            <CardContent>
              <Typography variant="h4">
                {matchedDataSet[0].dataset}
              </Typography>
              <ul>{formattedNotes}</ul>
            </CardContent>
          </Card>
        </Grid>
      );
    }
    return null;
  });

  return (
    <div>
      <Typography variant="h3" className={classes.centered}>
        Dataset Release Notes
      </Typography>
      <Grid container>{notesPerDataSet}</Grid>
    </div>
  );
}
