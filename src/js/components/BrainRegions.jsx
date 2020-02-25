import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Document, Page } from 'react-pdf';
import * as d3 from 'd3';
import './BrainRegions.css';


export default function BrainRegions(props) {
  const { onClose } = props;
  return (
    <Dialog fullWidth maxWidth="lg" open onClose={onClose}>
      <DialogTitle>Brain regions</DialogTitle>
      <DialogContent>
        <Document file="/public/brainregions.pdf">
          <Page pageNumber={1} scale={1.1} />
        </Document>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BrainRegions.propTypes = {
  onClose: PropTypes.func.isRequired,
};

function buildRoiTree(roiTree, treeRef) {
  // set the dimensions and margins of the diagram
  const margin = { top: 40, right: 90, bottom: 50, left: 90 };
  const width = 5000 - margin.left - margin.right;
  const height = 2000 - margin.top - margin.bottom;

  // declares a tree layout and assigns the size
  const treemap = d3.tree().size([width, height]);

  //  assigns the data to a hierarchy using parent-child relationships
  const nodeHierarchy = d3.hierarchy(roiTree);

  // maps the node data to the tree layout
  const nodes = treemap(nodeHierarchy);

  const existingSVGs = treeRef.current.getElementsByTagName('svg');
  Array.from(existingSVGs).forEach(svg => {
    treeRef.current.removeChild(svg);
  });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  const svg = d3
    .select(treeRef.current)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    // .attr('preserveAspectRatio', 'xMinYMin meet')
    // .attr('style', 'max-width: 100%')
    .attr(
      'viewBox',
      `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
    );

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // adds the links between the nodes
  g.selectAll('.link')
    .data(nodes.descendants().slice(1))
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d => {
      const path = `M${d.x},${d.y}C${d.x},${(d.y + d.parent.y) / 2} ${d.parent.x},${(d.y +
        d.parent.y) /
        2} ${d.parent.x},${d.parent.y}`;
      return path;
    });

  // adds each node as a group
  const node = g
    .selectAll('.node')
    .data(nodes.descendants())
    .enter()
    .append('g')
    .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  // adds the circle to the node
  node.append('circle').attr('r', 10);

  // adds the text to the node
  node
    .append('text')
    .attr('dy', '.35em')
    .attr('y', d => (d.children ? -20 : 20))
    .style('text-anchor', 'middle')
    .text(d => d.data.name);
}

function BrainRegionsTree(props) {
  const { onClose, dataSet } = props;

  const treeRef = useRef(null);

  const [roiTree, setRoiTree] = useState();
  useEffect(() => {
    const QueryUrl = '/api/custom/custom?np_explorer=roi_hierarchy';
    const QueryParameters = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        cypher: 'MATCH (n:Meta) RETURN n.roiHierarchy',
        dataset: dataSet
      }),
      method: 'POST',
      credentials: 'include'
    };

    fetch(QueryUrl, QueryParameters)
      .then(result => result.json())
      .then(resp => {
        setRoiTree(JSON.parse(resp.data[0]));
      });
  }, [treeRef.current]);

  return (
    <Dialog fullWidth maxWidth="lg" open onClose={onClose}>
      <DialogTitle>Brain regions</DialogTitle>
      <DialogContent>
        <DialogContentText>Brain Regions</DialogContentText>
        <div ref={treeRef} />
        {roiTree && buildRoiTree(roiTree, treeRef)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BrainRegionsTree.propTypes = {
  onClose: PropTypes.func.isRequired,
  dataSet: PropTypes.string.isRequired
};
