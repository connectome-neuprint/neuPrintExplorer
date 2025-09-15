/*
 * Handle neo4j server information.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'underscore';
import C from '../reducers/constants';

export function sortRois(a, b) {
  const aStartsWithLetter = a.charAt(0).match(/[a-z]/i);
  const bStartsWithLetter = b.charAt(0).match(/[a-z]/i);
  if (aStartsWithLetter && !bStartsWithLetter) return -1;
  if (bStartsWithLetter && !aStartsWithLetter) return 1;
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

function fetchDataSetColumnDefaults(datasets, setNeoDatasetColumnDefaults) {

  const columnDefaults = Promise.all(datasets.map((dataset) => fetch('/api/custom/custom?np_explorer=column_request', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      dataset,
      cypher: `MATCH (n:Meta) RETURN n.neuronColumns, n.neuronColumnsVisible`,
    }),
    method: 'POST',
    credentials: 'include',
  })
    .then((result) => {
      if (result.ok) {
        return result.json();
      }
      console.log(
        'Unable to fetch column headers, try reloading the page. If this error persists, please contact support.'
      );
    })
    .then((resp) => [dataset, resp])
  ));
  columnDefaults.then(defaults => {
    // build defaults object and store it in redux;
    const columnsByDataSet = {};

    defaults.forEach(dataset => {
      if (dataset[1]?.data[0] && dataset[1]?.data[0][0]) {
        const parsedColumnData = JSON.parse(dataset[1]?.data[0][0]);
        const fixedColumnData = parsedColumnData.map(column => {
          const updatedColumn = {...column};
          if (updatedColumn.id === "bodyId") {
            updatedColumn.name = 'id';
          }
          updatedColumn.status = column.visible;
          delete updatedColumn.visible;
          return updatedColumn;
        });
        columnsByDataSet[dataset[0]] = fixedColumnData;
      }
    });
    setNeoDatasetColumnDefaults(columnsByDataSet);
  });
}

class MetaInfo extends React.Component {
  componentDidMount() {
    const { userInfo, dataSet } = this.props;
    this.updateDB(userInfo);
    if (dataSet) {
      this.updateMetaRoiInfo();
    }
  }

  componentDidUpdate(prevProps) {
    const { userInfo, setNeoDatasets, setNeoServer, setVimoServer, dataSet } = this.props;
    if (prevProps.userInfo !== userInfo) {
      setNeoDatasets([], {}, {}, {});
      setNeoServer('');
      setVimoServer('');
    }

    if (!_.isEqual(prevProps.userInfo, userInfo)) {
      this.updateDB(userInfo);
    }

    if (dataSet && prevProps.dataSet !== dataSet) {
      this.updateMetaRoiInfo();
    }
  }

  updateMetaRoiInfo = () => {
    const { setRoiInfo, dataSet } = this.props;
    if (dataSet) {
      fetch('/api/custom/custom?np_explorer=meta_roi_info', {
        credentials: 'include',
        body: JSON.stringify({ cypher: 'MATCH (n:Meta) RETURN n.roiInfo', dataset: dataSet }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
        .then((result) => result.json())
        .then((resp) => {
          if (!('message' in resp)) {
            if (resp.data && resp.data[0]) {
              setRoiInfo(JSON.parse(resp.data[0][0]));
            }
          }
        });
    }
  };

  updateDB = () => {
    const {
      setNeoDatasets,
      setNeoServer,
      setNeoDatasetColumnDefaults,
      setVimoServer,
      setNeoServerPublic,
      setNeoServerPublicLoaded,
    } = this.props;
    fetch('/api/dbmeta/datasets', {
      credentials: 'include',
    })
      .then((result) => result.json())
      .then((items) => {
        if (!('message' in items)) {
          const datasets = [];
          const rois = {};
          const superRois = {};
          const datasetInfo = {};
          Object.entries(items).forEach((item) => {
            const [name, data] = item;
            datasets.push(name);
            rois[name] = data.ROIs.sort(sortRois);
            superRois[name] = data.superLevelROIs.sort(sortRois);
            datasetInfo[name] = {
              uuid: data.uuid,
              lastmod: data['last-mod'],
              info: data.info,
              hidden: data.hidden,
              maxVolumeSize: data.maxVolumeSize,
            };
          });
          setNeoDatasets(datasets, rois, superRois, datasetInfo);
          // for each dataset, load in the default column states for
          fetchDataSetColumnDefaults(datasets, setNeoDatasetColumnDefaults);
        }
      });

    fetch('/api/dbmeta/database', {
      credentials: 'include',
    })
      .then((result) => result.json())
      .then((data) => {
        if (!('message' in data)) {
          setNeoServer(data.Location);
        }
      });

    fetch('/api/vimoserver', {
      credentials: 'include',
    })
      .then((result) => result.json())
      .then((data) => {
        if (!('message' in data)) {
          setVimoServer(data.Url);
        }
      });

    fetch('/api/serverinfo', {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((result) => result.json())
      .then((resp) => {
        setNeoServerPublic(resp.IsPublic);
        setNeoServerPublicLoaded();
      });
  };

  render() {
    return <div />;
  }
}

MetaInfo.propTypes = {
  setNeoDatasets: PropTypes.func.isRequired,
  setNeoServer: PropTypes.func.isRequired,
  setVimoServer: PropTypes.func.isRequired,
  setNeoServerPublic: PropTypes.func.isRequired,
  setNeoServerPublicLoaded: PropTypes.func.isRequired,
  setNeoDatasetColumnDefaults: PropTypes.func.isRequired,
  setRoiInfo: PropTypes.func.isRequired,
  userInfo: PropTypes.object.isRequired,
  dataSet: PropTypes.string,
};

MetaInfo.defaultProps = {
  dataSet: null,
};

const MetaInfoState = (state) => ({
  userInfo: state.user.get('userInfo'),
});

const MetaInfoDispatch = (dispatch) => ({
  setNeoDatasets(datasets, rois, superRois, datasetInfo) {
    dispatch({
      type: C.SET_NEO_DATASETS,
      availableDatasets: datasets,
      availableROIs: rois,
      superROIs: superRois,
      datasetInfo,
    });
  },
  setNeoDatasetColumnDefaults(columnDefaults) {
    dispatch({
      type: C.SET_NEO_DATASET_COLUMN_DEFAULTS,
      columnDefaults
    });
  },
  setNeoServerPublic(publicState) {
    dispatch({
      type: C.SET_NEO_SERVER_PUBLIC,
      publicState,
    });
  },
  setNeoServerPublicLoaded() {
    dispatch({
      type: C.SET_NEO_SERVER_PUBLIC_LOADED,
      loaded: true,
    });
  },

  setNeoServer(server) {
    dispatch({
      type: C.SET_NEO_SERVER,
      neoServer: server,
    });
  },
  setRoiInfo(rois) {
    dispatch({
      type: C.SET_NEO_ROIINFO,
      rois,
    });
  },
  setVimoServer(url) {
    dispatch({
      type: C.SET_VIMO_URL,
      url,
    });
  },
});

export default connect(MetaInfoState, MetaInfoDispatch)(MetaInfo);
