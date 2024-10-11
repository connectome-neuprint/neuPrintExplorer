import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import NeuronFilter from "./NeuronFilter";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 250,
    maxWidth: 350,
  },
  expandablePanel: {
    margin: theme.spacing(1),
  },
  nopad: {
    padding: 0,
  },
  select: {
    fontFamily: theme.typography.fontFamily,
    margin: 0,
    marginTop: theme.spacing(1),
  },
  textField: {
    maxWidth: 230,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

// This function is imported by the components that import this component,
// as they typically need to convert the filters that this component
// provides, into cypher and it seems like a good idea to have that code in
// one place.
export function convertToCypher(type, values) {
  // special case for pre and post filters
  if (type.match(/^(pre|post)$/)) {
    if (Number.isInteger(values[0]) && values[0] > 0) {
      return `(neuron.${type} >= ${parseInt(values[0], 10)})`;
    }
    return '';
  }

  // generate the other chunks as an '=' statement
  const cypherChunks = values.map(value => {
    // if the value is empty or only contains white space, skip it
    if (value === '') {
      return null;
    }
    // if it is an integer, then it can't be wrapped in a quote or the
    // cypher matching wont work
    if (Number.isInteger(value)) {
      return `neuron.${type} = ${value}`
    }
    // everything else gets the default string match.
    return `neuron.${type} = "${value}"`
  }).filter(chunk => chunk !== null);

  // If after all that, we have a list of filters, then join them
  // together with an OR clause.
  if (cypherChunks.length > 0) {
    return `(${cypherChunks.join(' OR ')})`;
  }
  return '';
}

export function thresholdCypher(type, value) {
  if (Number.isInteger(value) && value > 0) {
    return `(neuron.${type} >= ${value})`;
  }
  return '';
}

export function statusCypher(statuses=[]) {
  if (statuses.length === 0) {
    return '';
  }

  return `(${statuses.map(status => `neuron.status = "${status}"`).join(' OR ')})`;
}


export default function NeuronFilterNew({ callback, actions, datasetstr, neoServer }) {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qsParams, setQsParams] = useState({});
  const classes = useStyles();

  useEffect(() => {
    // load in the filters and options
    setLoading(true);
    fetch('/api/custom/custom?np_explorer=neuron_filter_options', {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        dataset: datasetstr,
        cypher: `MATCH (n:Meta) RETURN n.neuronColumns`,
      }),
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        actions.metaInfoError(
          'Failed to load filter options. If this error persists, please contact support'
        );
        return null;
      })
      .then((result) => {
        if (result.data && result.data[0] && result.data[0][0] !== null) {
          setFilters(JSON.parse(result.data[0]));
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        actions.metaInfoError(
          `Failed to load filter options. If this error persists, please contact support: ${error}`
        );
      });
  }, [datasetstr, neoServer, actions]);

  if (loading) {
    return (
      <div className={classes.expandablePanel}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Optional neuron/segment filters</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.nopad}>
            <p>Loading...</p>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }

  if (!loading && filters.length === 0) {
    return (<NeuronFilter
      callback={callback}
      datasetstr={datasetstr}
      actions={actions}
      neoServer={neoServer}
    />);
  }

  function handleTextChange(event, paramType) {
    const { value } = event.target;
    const newParams = { ...qsParams, ...{ [paramType]: value } };
    callback(newParams);
    actions.setQueryString({ NFilter: { [paramType]: value } });
    setQsParams(newParams);
  }

  function handleChange(selected, paramType) {
    const values = selected ? selected.map((item) => item.value) : [];
    const newParams = { ...qsParams, ...{ [paramType]: values } };
    // save back status selections
    callback(newParams);
    actions.setQueryString({ NFilter: { [paramType]: values } });
    setQsParams(newParams);
  }

  const filterInputs = filters
    .map((filter) => {
      if (filter.id.match(/^(bodyId|type|instance)$/) || filter.choices === undefined) {
        return null;
      }
      // have to check here to make sure someone has provided a choices attribute
      // and that it is an array.
      if (!filter.choices || !Array.isArray(filter.choices)) {
        return (
          <FormControl className={classes.formControl} key={filter.id}>
            <FormLabel style={{ display: 'inline-flex' }}>{filter.name}</FormLabel>
            <TextField
              variant="outlined"
              margin="dense"
              rows={1}
              value={qsParams[filter.id] || ''}
              rowsMax={1}
              className={classes.textField}
              onChange={(event) => handleTextChange(event, filter.id)}
            />
          </FormControl>
        );
      }
      // if we are provided with choices, then we can use a select box to allow the user
      // to select the correct choice.
      const options = filter.choices.map((choice) => ({
        label: choice,
        value: choice,
      }));
      return (
        <FormControl className={classes.formControl} key={filter.id}>
          <FormLabel style={{ display: 'inline-flex' }}>{filter.name}</FormLabel>
          <Select
            className={classes.select}
            isMulti
            // value={modalityValue}
            onChange={(event) => handleChange(event, filter.id)}
            options={options}
            closeMenuOnSelect={false}
          />
        </FormControl>
      );
    })
    .filter((input) => input !== null);

  return (
    <div className={classes.expandablePanel}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Optional neuron/segment filters</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.nopad}>
          <FormControl className={classes.formControl}>
            <Typography variant="subtitle1" component="p">
              Filter by:{' '}
            </Typography>
            <FormLabel style={{ display: 'inline-flex' }}>minimum # pre (optional)</FormLabel>
            <TextField
              type="number"
              variant="outlined"
              margin="dense"
              rows={1}
              value={qsParams.preThreshold}
              rowsMax={1}
              className={classes.textField}
              onChange={(event) => handleTextChange(event, 'pre')}
            />
            <FormLabel style={{ display: 'inline-flex' }}>minimum # post (optional)</FormLabel>
            <TextField
              variant="outlined"
              margin="dense"
              type="number"
              rows={1}
              value={qsParams.postThreshold}
              rowsMax={1}
              className={classes.textField}
              onChange={(event) => handleTextChange(event, 'post')}
            />
            {filterInputs}
          </FormControl>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

NeuronFilterNew.propTypes = {
  callback: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  datasetstr: PropTypes.string.isRequired,
  neoServer: PropTypes.string.isRequired,
};
