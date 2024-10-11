import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { SunburstLoader, SkeletonLoader } from 'plugins/support';
import CellTypeHeatMap from './CellTypeView/CellTypeHeatMap';
import Connections from './CellTypeView/Connections';
import MissingConnections from './CellTypeView/MissingConnections';
import NeuronSelection from './CellTypeView/NeuronSelection';

class CellTypeView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exemplarId: null,
      graphicTab: 0
    };
  }

  componentDidMount() {
    const { query } = this.props;
    const { result } = query;
    this.setState({ exemplarId: parseInt(result.data['centroid-neuron'], 10) });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { query } = this.props;
    if (deepEqual(nextProps.query.result, query.result) &&
      deepEqual(nextState, this.state) &&
      deepEqual(nextProps.query.visProps, query.visProps)
    ) {
      return false;
    }
    return true;
  }


  handleExemplarChange = selected => {
    this.setState({ exemplarId: parseInt(selected.value, 10) });
  };

  handleGraphicChange = (event, selected) => {
    this.setState({ graphicTab: selected });
  };

  render() {
    const { exemplarId, graphicTab } = this.state;
    const { query, actions } = this.props;

    if (!exemplarId) {
      return <p>loading</p>;
    }

    const exemplar = query.result.data.neuroninfo[exemplarId] || {};
    const neuronCount = Object.keys(query.result.data.neuroninfo).length;

    return (
      <div className="celltype">
        <Typography variant="h4" gutterBottom>
          Cell Type: {query.pm.cellType}
        </Typography>
        <p>Neuron count: {neuronCount}</p>

        <Grid container spacing={4}>
          <Grid item xs={6}>
            <InputLabel htmlFor="exemplarSelect">Select an example instance.</InputLabel>
            <NeuronSelection
              neuronInfo={query.result.data.neuroninfo}
              exemplarId={exemplarId}
              onChange={this.handleExemplarChange}
            />
            <p>Inputs & Outputs summary</p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Inputs</TableCell>
                  <TableCell align="center">Outputs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="center">{exemplar['input-size']}</TableCell>
                  <TableCell align="center">{exemplar['output-size']}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>
          <Grid item xs={6}>
            <Tabs
              value={graphicTab}
              onChange={this.handleGraphicChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Skeleton" />
              <Tab label="Sunburst" />
            </Tabs>
            {graphicTab === 0 && (
              <SkeletonLoader
                bodyIds={[parseInt(exemplarId, 10)]}
                dataSet={query.pm.dataset}
                onError={actions.metaInfoError}
              />
            )}
            {graphicTab === 1 && (
              <SunburstLoader
                bodyId={parseInt(exemplarId, 10)}
                dataSet={query.pm.dataset}
                onError={actions.metaInfoError}
              />
            )}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Top inputs/outputs for {exemplarId}</Typography>
            <Connections id={exemplarId} result={query.result.data['neuron-inputs']} title="Cell Type Inputs" />
            <Connections id={exemplarId} result={query.result.data['neuron-outputs']} title="Cell Type Outputs" />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Missing inputs/outputs</Typography>
            {neuronCount > 1 ? (
              <>
                <MissingConnections
                  title="Missing Outputs"
                  id={exemplarId}
                  data={query.result.data['neuron-missed-outputs']}
                />
                <MissingConnections
                  title="Missing Inputs"
                  id={exemplarId}
                  data={query.result.data['neuron-missed-inputs']}
                />
              </>
            ) : (<p>Missing inputs/outputs are not calculated for a single neuron.</p>)}
          </Grid>
        </Grid>

        <Typography variant="h6">Common inputs</Typography>
        {neuronCount > 1 ? (
          <CellTypeHeatMap
            data={query.result.data['common-inputs']}
            median={query.result.data['common-inputs-med']}
            neuronInfo={query.result.data.neuroninfo}
          />
        ) : (<p>Common inputs are not calculated for a single neuron.</p>)}
        <Typography variant="h6">Common outputs</Typography>
        {neuronCount > 1 ? (
          <CellTypeHeatMap
            data={query.result.data['common-outputs']}
            median={query.result.data['common-outputs-med']}
            neuronInfo={query.result.data.neuroninfo}
          />
        ) : (<p>Common Outputs are not calculated for a single neuron.</p>)}

      </div>
    );
  }
}

CellTypeView.propTypes = {
  query: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default CellTypeView;
