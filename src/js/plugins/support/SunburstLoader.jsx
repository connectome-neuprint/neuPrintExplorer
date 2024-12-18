import React from 'react';
import PropTypes from 'prop-types';
import SunburstFormatter from './SunburstFormatter';

class SunburstLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rawData: null,
      superROIs: null,
    };
  }

  componentDidMount() {
    // fetch information about super ROIs.
    this.fetchSuperROIs();
    // fetch information about inputs/outputs
    this.fetchConnections();
  }

  componentDidUpdate(prevProps) {
    const { bodyId, dataSet } = this.props;
    if (prevProps.bodyId !== bodyId || prevProps.dataSet !== dataSet) {
      this.fetchConnections();
    }
    if (prevProps.dataSet !== dataSet) {
      this.fetchSuperROIs();
    }
  }

  fetchConnections() {
    const { bodyId, dataSet, onError } = this.props;
    const cypher = `MATCH (n :Neuron {bodyId: ${bodyId}})-[x :ConnectsTo]->(m) RETURN m.bodyId, m.type, x.weight, x.roiInfo, m.status, 'downstream' as direction UNION MATCH (n :Neuron {bodyId: ${bodyId}})<-[x :ConnectsTo]-(m) RETURN m.bodyId, m.type, x.weight, x.roiInfo, m.status, 'upstream' as direction`;

    const parameters = {
      cypher,
      dataset: dataSet,
    };

    const queryUrl = '/api/custom/custom?np_explorer=sunburst_loader';
    const querySettings = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(parameters),
      credentials: 'include',
      method: 'POST',
    };

    fetch(queryUrl, querySettings)
      .then((result) => result.json())
      .then((resp) => {
        this.setState({ rawData: resp.data });
      })
      .catch((error) => {
        onError(error);
      });
  }

  fetchSuperROIs() {
    const { dataSet, onError } = this.props;
    const cypher = `MATCH (n:Meta) RETURN n.superLevelRois`;

    const parameters = {
      cypher,
      dataset: dataSet,
    };

    const queryUrl = '/api/custom/custom?np_explorer=sunburst_loader_rois';
    const querySettings = {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(parameters),
      credentials: 'include',
      method: 'POST',
    };

    fetch(queryUrl, querySettings)
      .then((result) => result.json())
      .then((resp) => {
        this.setState({ superROIs: resp.data[0][0] });
      })
      .catch((error) => {
        onError(error);
      });
  }

  render() {
    const { rawData, superROIs } = this.state;
    const { bodyId, onError, actions, dataSet } = this.props;
    if (rawData && superROIs) {
      return (
        <SunburstFormatter
          bodyId={bodyId}
          rawData={rawData}
          superROIs={superROIs}
          onError={onError}
          actions={actions}
          dataSet={dataSet}
        />
      );
    }
    return <p>Loading</p>;
  }
}

SunburstLoader.propTypes = {
  bodyId: PropTypes.number.isRequired,
  dataSet: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
};

export default SunburstLoader;
