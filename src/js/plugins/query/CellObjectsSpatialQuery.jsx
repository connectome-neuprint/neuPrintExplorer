/*
 * Find objects in a cell given coordinates and a radius.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

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
  }

  submitQuery = () => {
    const { dataSet, submit } = this.props;
    const { x, y, z, radius, types } = this.state;

    let whereClause = '';
    if (types && types.length > 0) {
      const conditions = types.map((type) => `n.type = '${type}'`).join(' OR ');
      whereClause = ` AND ${conditions} `;
    }
    const cypher = `MATCH (n :Element) WHERE distance(point({x:${x}, y:${y}, z:${z}}), n.location) < ${radius} ${whereClause} return ID(n), n.type, n`;

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
  };

  catchReturn = (event) => {
    // submit request if user presses enter
    if (event.keyCode === 13) {
      event.preventDefault();
      this.submitQuery();
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
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="x"
            multiline
            fullWidth
            rows={1}
            value={x}
            rowsMax={1}
            className={classes.textField}
            onChange={(event) => this.setState({x: event.target.value})}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="y"
            multiline
            fullWidth
            rows={1}
            value={y}
            rowsMax={1}
            className={classes.textField}
            onChange={(event) => this.setState({y: event.target.value})}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="z"
            multiline
            fullWidth
            rows={1}
            value={z}
            rowsMax={1}
            className={classes.textField}
            onChange={(event) => this.setState({z: event.target.value})}
            onKeyDown={this.catchReturn}
          />
        </FormControl>
        <FormControl fullWidth className={classes.formControl}>
          <TextField
            label="radius"
            multiline
            fullWidth
            rows={1}
            value={radius}
            rowsMax={1}
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
          disabled={isQuerying}
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
