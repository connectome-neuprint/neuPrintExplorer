/* global VERSION */
import React from 'react';

import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing.unit * 2
  },
  centered: {
    textAlign: 'center'
  },
  spaced: {
    margin: '1em 0'
  }
});

function newIssue(e) {
  e.preventDefault();
  window.open('https://github.com/connectome-neuprint/neuPrintExplorer/issues/new?labels=user');
}

class About extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: 'Loading user issues from GitHub'
    }
  }
    componentDidMount() {
      fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': 'token 9cbe7a950926bf8784ca8d95de00a8e963c32315',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '{ organization(login:"connectome-neuprint") { repositories(first: 50, orderBy: {field: NAME, direction:ASC}) { edges { node { name issues(first:50, states:[OPEN], labels: [user]) { edges { node { title url number body}}}}}}}}'
        })
      })
      .then(result => result.json())
      .then(result => {
        let issuelist = [];
        let repoedges = result.data.organization.repositories.edges;
        repoedges.forEach(function(repoedge) {
          let edges = repoedge.node.issues.edges;
          edges.forEach(function(issue) {
            issuelist.push([issue.node.title,issue.node.url,issue.node.number,issue.node.body]);
          });
        });
        const listItems = issuelist.map((iss) =>
          <li key={iss[2].toString()}><Tooltip title={iss[3]} placement={'bottom'} enterDelay={100}><a href={iss[1]} style={{color: "darkblue"}}>{iss[0]}</a></Tooltip></li>
        );
        if (issuelist.length === 0) {
          this.setState({
            data: 'No user issues found'
          })
        }
        else {
          this.setState({
            data:<ul>{listItems}</ul> 
          })
        }
      })
      .catch(function(error) {
        alert(error);
      });
    };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Typography variant="h3" className={classes.centered}>
          neuPrint Explorer
        </Typography>
        <Typography variant="body1" className={classes.centered}>
          Version: {VERSION}
        </Typography>
        <Divider light={true} className={classes.spaced} />
        <Typography variant="h6">About:</Typography>
        <Typography variant="body1" className={classes.spaced}>
          neuPrint Explorer is web based tool to query and visualize connectomic data stored in
          neuPrint, a neo4j graph database of the connectome.{' '}
        </Typography>

        <Typography variant="h6">Log an issue:</Typography>
        <Typography variant="body1" className={classes.spaced}>
          Note that you currently need to have a GitHub account to submit issues.<br/>
          <Button variant="contained" color="primary" className={classes.button} onClick={newIssue}>
          New issue
          </Button>
        </Typography>

        <Typography variant="h6">Issue list</Typography>
        {this.state.data}

        <Typography variant="h6">Contact us:</Typography>
        <Typography variant="body1" className={classes.spaced}>
          <Icon>mail_outline</Icon>
          <a href="mailto:neuprint@janelia.hhmi.org">
            neuprint@janelia.hhmi.org
          </a>
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(About);
