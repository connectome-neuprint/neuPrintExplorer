import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

class News extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newsItems: [] // these get populated from a static file on the server
    };
  }

  componentDidMount() {
    // load in the news items from a static file on the server
    fetch('/public/news.json')
      .then(resp => resp.json())
      .then(data => this.setState({newsItems: data.items}))
      .catch(() => {
        this.setState({newsItems: ['Error loading news items.']})
      });
  }

  render() {
    const { newsItems } = this.state;
    const itemList = newsItems.map(item => <li key={item}>{item}</li>);
    return (
      <Card>
        <CardHeader
          title="News & Release Notes"
          className="homeCardHeader"
          avatar={
            <NewReleasesIcon color="primary" />
          }
        />
        <CardContent>
          <ul>
            {itemList}
          </ul>
        </CardContent>
      </Card>
    );
  }
}

export default News;
