import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme =>
  createStyles({
    centered: {
      textAlign: 'center'
    },
    notepaper: {
      margin: theme.spacing(2)
    }
  })
);

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

  const notesPerDataSet = Object.entries(datasetInfo).sort((a,b) => (new Date(b[1].lastmod) - new Date(a[1].lastmod))).map((k) => k[0]).map(key => {
    const matchedDataSet = releaseNotes.filter(note => note.dataset === key);
    if (matchedDataSet.length > 0) {
      const formattedNotes = matchedDataSet[0].notes.map(note => <li key={note}>{note}</li>);
      const formattedLinks = Object.keys(matchedDataSet[0].links).map(link => (
        <li key={link}>
          <a href={matchedDataSet[0].links[link]}>{link}</a>
        </li>
      ));

      return (
        <Grid key={key} item xs={12} className={classes.notepaper}>
          <Card>
            <CardContent>
              <Typography variant="h4">{matchedDataSet[0].dataset} - {matchedDataSet[0].date}</Typography>
              <Typography variant="h5">Notes</Typography>
              <ul>{formattedNotes}</ul>
              <Typography variant="h5">Links</Typography>
              <ul>{formattedLinks}</ul>
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
