/*
 * Find object and show parent and connections given coordinates.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
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

const pluginName = 'FindObjects';
const pluginAbbrev = 'fo';

const columnHeaders = {
  mitochondrion: ['Connection Type', 'Location', 'Size', 'MitoType'],
  pre: ['Connection Type', 'Location', 'Confidence'],
  post: ['Connection Type', 'Location', 'Confidence'],
};

const pctFormatter = Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
});

function formatRow({type, data, submitFunc, query, connectionType}) {
   // convert location to a clickable link
  const [x, y, z] = data.location.coordinates;
  const cypher = `MATCH (n :Element)-[x]-(m :Element) WHERE n.location = Point({x:${x} ,y:${y} ,z:${z}}) return ID(m), m.type, m, n, x, type(x)`;
  const objectQuery = {
    dataSet: query.ds,
    pluginCode: 'fo',
    pluginName: 'FindObjects',
    parameters: {
      dataset: query.ds,
      cypherQuery: cypher,
      x,
      y,
      z
    }
  };

  const handleLocationJump = () => {
    submitFunc(objectQuery);
  };

  const locationLinkStyle = {
    padding: 0,
    margin: 0,
    textDecoration: 'underline',
    color: '#396a9f',
  };

  const locationLink = (
    <Button onClick={handleLocationJump} style={locationLinkStyle}>
      {data.location.coordinates.join(',')}
    </Button>
  );


  if (type === 'mitochondrion') {
    return [connectionType, locationLink, data.size, data.mitoType];
  }
  return [connectionType, locationLink, pctFormatter.format(data.confidence)];
}

export class FindObjects extends React.Component {
  static get details() {
    return {
      name: pluginName,
      displayName: 'Find Objects',
      abbr: pluginAbbrev,
      description: 'Find objects at a point',
      visType: 'FindObjectsView',
    };
  }

  static fetchParameters() {
    return {};
  }

  static processResults({ query, apiResponse, submitFunc }) {
    // data and headers are formatted and
    // returned here, instead of parsing it in the view.
    const recordsByType = apiResponse.data.reduce((acc, record) => {
      const [, type, data, , ,connectionType] = record;
      // format the data into columns according to the type.
      const row = formatRow({type, data, submitFunc, query, connectionType});
      return { ...acc, [type]: [...(acc[type] || []), row] };
    }, {});

    let matchedObject;
    if (apiResponse.data && apiResponse.data.length > 0) {
      const [firstResult] = apiResponse.data;
      [ , , , matchedObject] = firstResult;
    }

    const coords = `${query.pm.x}, ${query.pm.y}, ${query.pm.z}`;

    return {
      columns: columnHeaders,
      data: {
        matchedObject,
        connections: recordsByType,
      },
      debug: apiResponse.debug,
      title: `Object at ${coords}`,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      x: undefined,
      y: undefined,
      z: undefined,
      errorMessage: '',
    };
  }

  submitQuery = () => {
    const { dataSet, submit } = this.props;
    const { x, y, z } = this.state;

    const cypher = `MATCH (n :Element)-[x]-(m :Element) WHERE n.location = Point({x:${x} ,y:${y} ,z:${z}}) return ID(m), m.type, m, n, x, type(x)`;

    const query = {
      dataSet,
      plugin: pluginName,
      pluginCode: pluginAbbrev,
      parameters: {
        cypherQuery: cypher,
        dataset: dataSet,
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

  render() {
    const { classes, isQuerying } = this.props;
    const { x, y, z, errorMessage } = this.state;

    return (
      <div>
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
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={this.submitQuery}
          disabled={isQuerying}
        >
          Search By Coordinates
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

FindObjects.propTypes = {
  submit: PropTypes.func.isRequired,
  dataSet: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  isQuerying: PropTypes.bool.isRequired,
};

export default withStyles(styles, { withTheme: true })(FindObjects);
