import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import NewReleasesIcon from '@material-ui/icons/NewReleases';

class News extends React.Component {
  componentDidMount() {
    // load in the news items from the api? static file on the server?
  }

  render() {
    return (
      <Card>
        <CardHeader
          title="New Features"
          className="homeCardHeader"
          avatar={
            <NewReleasesIcon color="primary" />
          }
        />
        <CardContent>
          <p>News items here</p>
        </CardContent>
      </Card>
    );
  }
}

export default News;
