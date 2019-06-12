/* global VERSION */
import React from 'react';

import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
    overflow: 'auto',
    margin: theme.spacing.unit * 2
  },
  centered: {
    textAlign: 'center'
  },
  spaced: {
    margin: '1em 0'
  },
  contactIcon: {
    verticalAlign: 'middle'
  }
});

const labelcolor = {
  architecture: '#e888e6',
  bug: '#d73a4a',
  complex: '#e6e6e6',
  documentation: '#2852ed',
  duplicate: '#cfd3d7',
  enhancement: '#a2eeef',
  future: '#61ed6a',
  'good first issue': '#7057ff',
  'help wanted': '#008672',
  invalid: '#e4e669',
  'in progress': '#ededed',
  nicetohave: '#f298c2',
  question: '#d876e3',
  small: '#e6e6e6',
  style: '#8f95e8',
  'to do': '#ededed',
  user: '#4264bc'
};
const darkLabels = ['bug', 'documentation', 'good first issue', 'help wanted', 'user'];

function newIssue(e) {
  e.preventDefault();
  window.open(
    'https://github.com/connectome-neuprint/neuPrintExplorer/issues/new?labels=user&body=(Please%20provide%20additional%20details)'
  );
}

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: 'Loading user issues from GitHub...'
    };
  }

  componentDidMount() {
    const { token } = this.props;
    if (token === '') {
      return;
    }
    this.loadIssues();
  }

  componentDidUpdate(nextProps) {
    const { token } = this.props;
    if (nextProps.token === token) {
      return;
    }
    this.loadIssues();
  }

  loadIssues() {
    const { token, appDB } = this.props;
    /* Call to Google API function */
    fetch(`${appDB}/gitinfo`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        organization: 'connectome-neuprint'
      })
    })
      .then(result => result.json())
      .then(result => {
        const fulllist = [];
        const repoedges = result.data.organization.repositories.edges;
        repoedges.forEach(repoedge => {
          const reponame = repoedge.node.name;
          const issuelist = [];
          const { edges } = repoedge.node.issues;
          edges.forEach(issue => {
            const labelList = [];
            const tagList = [];
            if (issue.node.labels.edges.length > 0) {
              const labels = issue.node.labels.edges;
              labels.forEach(labeledge => {
                const { name } = labeledge.label;
                labelList.push(name);
                const divid = name + issue.node.number;
                let txtcolor = 'black';
                if (darkLabels.includes(name)) {
                  txtcolor = 'white';
                }
                const tagstyle = {
                  borderRadius: '10px',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  marginLeft: '5px',
                  float: 'left',
                  fontFamily: 'sans-serif',
                  color: txtcolor,
                  textIndent: 'initial',
                  backgroundColor: labelcolor[name]
                };
                tagList.push(
                  <div key={divid} style={tagstyle}>
                    <span>{labeledge.label.name}</span>
                  </div>
                );
              });
            }
            issuelist.push([
              issue.node.title,
              issue.node.url,
              issue.node.number,
              issue.node.body,
              tagList
            ]);
          });
          if (issuelist.length > 0) {
            const listItems = issuelist.map(issue => {
              const [title, url, number, body, tags] = issue;
              return (
                <li key={number.toString() + title}>
                  <div style={{ float: 'left' }}>
                    <Tooltip title={body} placement="bottom" enterDelay={100}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'darkblue' }}
                      >
                        <Typography variant="body1">{title}</Typography>
                      </a>
                    </Tooltip>
                  </div>
                  <div style={{ float: 'left' }}>{tags}</div>
                  <div style={{ clear: 'both' }} />
                </li>
              );
            });
            const listing = (
              <div key={reponame}>
                <Typography variant="body1">
                  {reponame}
                </Typography>
                <ul>{listItems}</ul>
              </div>
            );
            fulllist.push(listing);
          }
        });
        if (fulllist.length === 0) {
          this.setState({
            data: 'No user issues found'
          });
        } else {
          this.setState({
            data: <span>{fulllist}</span>
          });
        }
      })
      .catch(error => {
        this.setState({ data: error });
      });
  }

  render() {
    const { classes } = this.props;
    const { data } = this.state;

    return (
      <div className={classes.root}>
        <Typography variant="h3" className={classes.centered}>
          neuPrint Explorer
        </Typography>
        <Typography variant="body1" className={classes.centered}>
          Version: {VERSION}
        </Typography>
        <Divider light className={classes.spaced} />
        <Typography variant="h6">About</Typography>
        <Typography variant="body1" className={classes.spaced}>
          neuPrint Explorer is web based tool to query and visualize connectomic data stored in
          neuPrint, a neo4j graph database of the connectome.{' '}
        </Typography>

        <Typography variant="h6">Log an issue</Typography>
        <Typography variant="body1" className={classes.spaced}>
          Note that you currently need to have a GitHub account to submit issues.
          <br />
          <Button variant="contained" color="primary" className={classes.button} onClick={newIssue}>
            New issue
          </Button>
        </Typography>

        <Typography variant="h6">Open issue list</Typography>
        {data}

        <Typography variant="h6">Contact us</Typography>
        <Typography variant="body1" className={classes.spaced}>
          <Icon className={classes.contactIcon}>mail_outline</Icon>
          <a href="mailto:neuprint@janelia.hhmi.org">neuprint@janelia.hhmi.org</a>
        </Typography>
      </div>
    );
  }
}

const AboutState = state => ({
  token: state.user.get('token'),
  appDB: state.app.get('appDB')
});

About.propTypes = {
  classes: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  appDB: PropTypes.string.isRequired
};

export default withStyles(styles)(
  connect(
    AboutState,
    null
  )(About)
);

/* export default withStyles(styles)(About); */
