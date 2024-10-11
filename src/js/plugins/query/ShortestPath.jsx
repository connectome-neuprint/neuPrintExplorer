/*
 * Query to find shortest path between two neurons.
 */

// TODO: add graph viz and change to all shortest paths
import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  textField: {
    margin: 4,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  formControl: {
    margin: theme.spacing(1)
  },
  button: {
    margin: 4,
    display: 'block'
  },
  clickable: {
    cursor: 'pointer'
  }
});

const pluginName = 'ShortestPath';
const pluginAbbrev = 'sp';

export class ShortestPath extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Shortest paths',
      abbr: pluginAbbrev,
      description: 'Find all neurons along the shortest paths between two neurons.',
      disabled: false,
      visType: 'Graph'
    };
  }

  static fetchParameters(params) {
    const { bodyId1, bodyId2, minWeight } = params;
    const shortestPathQuery = `call apoc.cypher.runTimeboxed('MATCH (src :Neuron { bodyId: ${bodyId1} }),(dest:Neuron{ bodyId: ${bodyId2} }), p = allShortestPaths((src)-[:ConnectsTo*]->(dest)) WHERE ALL (x in relationships(p) WHERE x.weight >= ${minWeight}) AND ALL (n in nodes(p) WHERE n.status="Traced") RETURN length(p) AS \`length(path)\`, [n in nodes(p) | [n.bodyId, n.type]] AS path, [x in relationships(p) | x.weight] AS weights', {},5000) YIELD value return  value.\`length(path)\` as \`length(path)\`, value.path as path, value.weights AS weights`;
    return {
      cypherQuery: shortestPathQuery
    };
  }

  static processResults({ query, apiResponse, actions }) {
    if (apiResponse.data.length === 0) {
      actions.pluginResponseError('No path found.');
      return {
        columns: apiResponse.columns,
        data: apiResponse.data,
        debug: apiResponse.debug
      };
    }

    let maxObsWeight;
    let minObsWeight;

    const foundNodes = {};
    const foundEdges = {};

    const startId = apiResponse.data[0][1][0][0];
    const startName = apiResponse.data[0][1][0][1];
    const startNode = {
      id: startId,
      label: startName !== null ? `${startName}\n(${startId})` : startId
    };
    foundNodes[startId] = startNode;

    const endId = apiResponse.data[0][1][apiResponse.data[0][1].length - 1][0];
    const endName = apiResponse.data[0][1][apiResponse.data[0][1].length - 1][1];
    const endNode = {
      id: endId,
      label: endName !== null ? `${endName}\n(${endId})` : endId
    };
    foundNodes[endId] = endNode;

    apiResponse.data.forEach(path => {
      const pathIdList = path[1].filter((_, index) => index > 0 && index < path[1].length - 1);
      const weightList = path[2];

      pathIdList.forEach(node => {
        const id = node[0];
        const name = node[1];
        foundNodes[id] = {
          id,
          label: name !== null ? `${name}\n(${id})` : id
        };
      });

      weightList.forEach((weight, index) => {
        const source = path[1][index][0];
        const target = path[1][index + 1][0];
        const key = `${source}:${target}`;
        foundEdges[key] = {
          source,
          target,
          label: weight,
          classes: 'autorotate'
        };

        if (maxObsWeight === undefined || maxObsWeight < weight) {
          maxObsWeight = weight;
        }
        if (minObsWeight === undefined || minObsWeight > weight) {
          minObsWeight = weight;
        }
      });
    });

    const nodes = [];
    const edges = [];

    Object.keys(foundNodes).forEach(node => {
      nodes.push({ data: foundNodes[node] });
    });
    Object.keys(foundEdges).forEach(edge => {
      edges.push({ data: foundEdges[edge] });
    });

    let title = 'Neurons along shortest path';

    if (query.pm && query.pm.bodyId1 && query.pm.bodyId2) {
      title = `Neurons along path between ${query.pm.bodyId1} and ${query.pm.bodyId2}`;
    }

    return {
      columns: apiResponse.columns,
      data: apiResponse.data,
      graph: {
        layout: 'breadthfirst',
        elements: { nodes, edges },
        minWeight: minObsWeight,
        maxWeight: maxObsWeight
      },
      debug: apiResponse.debug,
      title
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      bodyId1: '',
      bodyId2: '',
      minWeight: 10
    };
  }

  // creates query object and sends to callback
  processRequest = () => {
    const { dataSet, submit } = this.props;
    const { bodyId1, bodyId2, minWeight } = this.state;

    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: {
        dataset: dataSet,
        minWeight,
        bodyId1,
        bodyId2
      }
    };
    submit(query);
  };

  addBodyId1 = event => {
    this.setState({ bodyId1: event.target.value });
  };

  addBodyId2 = event => {
    this.setState({ bodyId2: event.target.value });
  };

  addMinWeight = event => {
    this.setState({ minWeight: event.target.value });
  };

  render() {
    const { isQuerying, classes } = this.props;
    const { bodyId1, bodyId2, minWeight } = this.state;

    return (
      <div>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="Neuron ID A"
            multiline
            fullWidth
            rows={1}
            value={bodyId1}
            rowsMax={1}
            className={classes.textField}
            onChange={this.addBodyId1}
          />
          <TextField
            label="Neuron ID B"
            multiline
            fullWidth
            rows={1}
            value={bodyId2}
            rowsMax={1}
            className={classes.textField}
            onChange={this.addBodyId2}
          />
          <TextField
            label="Minimum weight"
            multiline
            fullWidth
            type="number"
            rows={1}
            value={minWeight}
            rowsMax={1}
            className={classes.textField}
            onChange={this.addMinWeight}
          />
        </FormControl>
        <Button
          disabled={isQuerying}
          color="primary"
          variant="contained"
          onClick={this.processRequest}
        >
          Submit
        </Button>
      </div>
    );
  }
}

ShortestPath.propTypes = {
  dataSet: PropTypes.string.isRequired,
  isQuerying: PropTypes.bool.isRequired,
  submit: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(ShortestPath);
