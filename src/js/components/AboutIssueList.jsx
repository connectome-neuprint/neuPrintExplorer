import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

const darkLabels = ['bug', 'documentation', 'good first issue', 'help wanted', 'user'];

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


export default function AboutIssueList({token, appDB}) {
  const [data, setData] = useState('Loading user issues from GitHub...');

  useEffect(() => {
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
        if (
          result &&
          result.data &&
          result.data.organization &&
          result.data.organization.repositories
        ) {
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
                  <Typography variant="body1">{reponame}</Typography>
                  <ul>{listItems}</ul>
                </div>
              );
              fulllist.push(listing);
            }
          });
        }
        if (fulllist.length === 0) {
          setData('No user issues found');
        } else {
          setData(<span>{fulllist}</span>);
        }
      })
      .catch(error => {
        setData(error);
      });

  }, []);

  return (
    <>{data}</>
  );
}

AboutIssueList.propTypes = {
  token: PropTypes.string.isRequired,
  appDB: PropTypes.string.isRequired
};


