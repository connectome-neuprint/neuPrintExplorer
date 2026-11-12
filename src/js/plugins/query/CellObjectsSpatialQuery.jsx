/*
 * Find objects in a cell given coordinates and a radius.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import withStyles from '@mui/styles/withStyles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { fetchKernelVersion, kernelMajor } from './shared/neo4jVersion';

const styles = (theme) => ({
  textField: {
    margin: 4,
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  formControl: {
    margin: theme.spacing(1),
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: '0.5em 0 1em 0',
  },
  button: {
    margin: 4,
    display: 'block',
  },
  noBodyError: {
    fontSize: '0.9em',
  },
  clickable: {
    cursor: 'pointer',
  },
});

const pluginName = 'CellObjectsSpatial';
const pluginAbbrev = 'csp';

const filterOptions = [
  { value: 'mitochondrion', label: 'Mitochondria' },
  { value: 'pre', label: 'Presynaptic Site' },
  { value: 'post', label: 'Postsynaptic Site' },
];

const columnHeaders = {
  mitochondrion: ['Location', 'Size', 'MitoType'],
  pre: ['Location', 'Confidence'],
  post: ['Location', 'Confidence'],
};

/* TODO: use a query like the one below to get the meta information that
 * we need to figure out what types of objects are in the database.

fetch('/api/custom/custom?np_explorer=meta', {
  credentials: 'include',
  body: JSON.stringify({ cypher: 'MATCH (n:Meta) RETURN n' }),
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
  .then((result) => result.json())
  .then((resp) => {
    console.log(resp);
    console.log(JSON.parse(resp.data[0][0].objectProperties));
  });

*/

const pctFormatter = Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function formatRow(type, data) {
  if (type === 'mitochondrion') {
    return [data.location.coordinates.join(','), data.size, data.mitoType];
  }
  return [data.location.coordinates.join(','), pctFormatter.format(data.confidence)];
}

// The name of the Cypher function that measures the distance between two
// points, for a server with the given kernel version.
//
// No single name works on every server this build talks to. Neo4j 5.0 removed
// distance() in favour of point.distance(): 3.5 has only distance(), 4.4 has
// both, and 5.x and CalVer have only point.distance(). Measured on 3.5.3,
// 4.4.16 and 2026.08.1. Servers below 5 keep distance(), so the 3.5 and 4.4
// servers receive the function they always have.
//
// Returns null when the version cannot be read. Guessing would send one
// generation a query it is certain to reject.
export function distanceFunction(kernelVersion) {
  const major = kernelMajor(kernelVersion);
  if (major === null) {
    return null;
  }
  return major >= 5 ? 'point.distance' : 'distance';
}

// Build the Cypher that finds the objects within radius of a point. distance
// is the function name that distanceFunction() chose for the server.
export function buildSpatialCypher({ x, y, z, radius, types = [], distance }) {
  let typeFilter = '';
  if (types && types.length > 0) {
    const conditions = types.map((type) => `n.type = '${type}'`).join(' OR ');
    // The parentheses matter: AND binds tighter than OR, so without them
    // every type after the first would match at any distance.
    typeFilter = ` AND (${conditions})`;
  }

  return `MATCH (n :Element) WHERE ${distance}(point({x:${x}, y:${y}, z:${z}}), n.location) < ${radius}${typeFilter} return ID(n), n.type, n`;
}

export class CellObjectsSpatialQuery extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Spatial Query',
      abbr: pluginAbbrev,
      description: 'Find objects around a point',
      visType: 'ObjectsView',
    };
  }

  static fetchParameters() {
    return {};
  }

  static processResults({ query, apiResponse }) {
    // data and headers are formatted and
    // returned here, instead of parsing it in the view.
    const recordsByType = apiResponse.data.reduce((acc, record) => {
      const [, type, data] = record;
      // format the data into columns according to the type.
      const row = formatRow(type, data);
      return { ...acc, [type]: [...(acc[type] || []), row] };
    }, {});

    const coords = `${query.pm.x}, ${query.pm.y}, ${query.pm.z}`;

    return {
      columns: columnHeaders,
      data: recordsByType,
      debug: apiResponse.debug,
      title: `Objects within ${query.pm.radius} pixels of ${coords}`,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      radius: 100,
      x: undefined,
      y: undefined,
      z: undefined,
      errorMessage: '',
      types: [],
    };
    this.lookingUpVersion = false;
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  isValidCoordinate = (value) => {
    return value !== undefined && value !== '' && !isNaN(Number(value));
  };

  submitQuery = () => {
    const { dataSet, submit } = this.props;
    const { x, y, z, radius, types } = this.state;

    if (!this.isValidCoordinate(x) || !this.isValidCoordinate(y) || !this.isValidCoordinate(z)) {
      this.setState({ errorMessage: 'Please enter valid numbers for all coordinates (x, y, z)' });
      return;
    }

    if (!this.isValidCoordinate(radius)) {
      this.setState({ errorMessage: 'Please enter a valid number for radius' });
      return;
    }

    this.setState({ errorMessage: '' });

    // The version lookup below takes a moment. Ignore a second click until it
    // is done, so that one search does not submit twice.
    if (this.lookingUpVersion) {
      return;
    }
    this.lookingUpVersion = true;

    // Ask which Neo4j version holds this dataset before building the query.
    // The form values and the dataset were read above, so the search that
    // runs is the one the user submitted, whatever changes meanwhile.
    fetchKernelVersion(dataSet)
      .then((version) => ({ distance: distanceFunction(version) }))
      // Any failure so far, in the request or in reading its answer, ends in
      // the message below, and the guard is always released.
      .catch((error) => ({ distance: null, error }))
      .then(({ distance, error }) => {
        this.lookingUpVersion = false;

        // The form is gone, so the user has moved on to another plugin, page
        // or dataset. Drop the search rather than take them to its results.
        if (!this.mounted) {
          return;
        }

        if (distance === null) {
          const reason = error && error.message ? ` (${error.message})` : '';
          this.setState({
            errorMessage: `Could not read the Neo4j version of this dataset${reason}, so the search was not sent. Please try again.`,
          });
          return;
        }

        const cypher = buildSpatialCypher({ x, y, z, radius, types, distance });

        const query = {
          dataSet,
          plugin: pluginName,
          pluginCode: pluginAbbrev,
          parameters: {
            cypherQuery: cypher,
            dataset: dataSet,
            radius,
            x,
            y,
            z,
          },
          visProps: {
            rowsPerPage: 25,
          },
        };

        submit(query);
      });
  };

  catchReturn = (event) => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.submitQuery();
    }
  };

  handlePaste = (event) => {
    const pastedText = event.clipboardData.getData('text');
    const coordinates = pastedText.split(',').map(coord => coord.trim());

    if (coordinates.length === 3) {
      event.preventDefault();
      this.setState({
        x: coordinates[0],
        y: coordinates[1],
        z: coordinates[2],
      });
    }
  };

  handleChangeTypes = (selected) => {
    let types = [];
    if (selected) {
      types = selected.map((item) => item.value);
    }
    this.setState({ types });
  };

  render() {
    const { classes, isQuerying } = this.props;
    const { x, y, z, radius, errorMessage, types } = this.state;

    const typeValues = types.map((type) => ({
      label: type,
      value: type,
    }));

    return (
      <div>
        <InputLabel htmlFor="select-multiple-chip">Object Type Filter</InputLabel>
        <Select
          options={filterOptions}
          isMulti
          onChange={this.handleChangeTypes}
          value={typeValues}
        />
        <FormControl variant="standard" fullWidth className={classes.formControl}>
          <TextField
            label="x"
            multiline
            variant="standard"
            fullWidth
            rows={1}
            value={x}
            maxRows={1}
            className={classes.textField}
            onChange={(event) => this.setState({x: event.target.value})}
            onKeyDown={this.catchReturn}
            onPaste={this.handlePaste}
            InputLabelProps={{ shrink: x !== undefined && x !== '' ? true : undefined }}
            helperText="Tip: Paste comma-separated coordinates (x,y,z) into any field, to populate them all at once."
          />
        </FormControl>
        <FormControl variant="standard" fullWidth className={classes.formControl}>
          <TextField
            label="y"
            multiline
            variant="standard"
            fullWidth
            rows={1}
            value={y}
            maxRows={1}
            className={classes.textField}
            onChange={(event) => this.setState({y: event.target.value})}
            onKeyDown={this.catchReturn}
            onPaste={this.handlePaste}
            InputLabelProps={{ shrink: y !== undefined && y !== '' ? true : undefined }}
          />
        </FormControl>
        <FormControl variant="standard" fullWidth className={classes.formControl}>
          <TextField
            label="z"
            multiline
            variant="standard"
            fullWidth
            rows={1}
            value={z}
            maxRows={1}
            className={classes.textField}
            onChange={(event) => this.setState({z: event.target.value})}
            onKeyDown={this.catchReturn}
            onPaste={this.handlePaste}
            InputLabelProps={{ shrink: z !== undefined && z !== '' ? true : undefined }}
          />
        </FormControl>
        <FormControl variant="standard" fullWidth className={classes.formControl}>
          <TextField
            label="radius"
            multiline
            variant="standard"
            fullWidth
            rows={1}
            value={radius}
            maxRows={1}
            className={classes.textField}
            onChange={(event) => this.setState({radius: event.target.value})}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.submitQuery}
          disabled={isQuerying || !this.isValidCoordinate(x) || !this.isValidCoordinate(y) || !this.isValidCoordinate(z) || !this.isValidCoordinate(radius)}
        >
          Search
        </Button>
        {errorMessage !== '' && (
          <Typography color="error" className={classes.noBodyError}>
            {errorMessage}
          </Typography>
        )}
      </div>
    );
  }
}

CellObjectsSpatialQuery.propTypes = {
  submit: PropTypes.func.isRequired,
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
};

export default withStyles(styles, { withTheme: true })(CellObjectsSpatialQuery);
