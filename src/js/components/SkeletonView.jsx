import React from 'react';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import Immutable from 'immutable';
import PouchDB from 'pouchdb';
import deepEqual from 'deep-equal';

import Slider from '@material-ui/core/Slider';

import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import { pickTextColorBasedOnBgColorAdvanced } from '@neuprint/support';

import { MinSynapseRadius, MaxSynapseRadius } from 'actions/skeleton';

import ActionDrawer from './Skeleton/ActionDrawer';
import CompartmentSelection from './Skeleton/CompartmentSelection';

const styles = theme => ({
  root: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'white',
    overflow: 'hidden'
  },
  floater: {
    zIndex: 2,
    padding: theme.spacing(1),
    position: 'absolute',
    display: 'flex', // keeps the chips in a vertical column instead of a row.
    flexDirection: 'column'
  },
  compartments: {
    zIndex: 2,
    padding: theme.spacing(1),
    position: 'absolute',
    top: 0,
    right: 0
  },
  skel: {
    width: '100%',
    height: '100%',
    outline: 'none',
    background: '#ddd',
    zIndex: 1,
    position: 'relative'
  },
  chip: {
    margin: theme.spacing(0.5)
  },
  minimize: {
    zIndex: 2,
    position: 'absolute',
    top: '1em',
    right: '1em'
  },
  resetButton: {
    marginRight: '1em'
  },
  bottomControls: {
    position: 'absolute',
    bottom: '0px',
    left: '1em',
    zIndex: 2,
    width: '100%'
  },

  // The Material-UI Slider in the FormGroup called "bottomControls" is not styled correctly when
  // it is in a FormControlLabel.  A work-around is to put it in a span and give that span
  // some of the styling from the FormControlLabel source code.

  bottomControlsSlider: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    marginLeft: -11,
    marginRight: 16,
    minWidth: '150px',
    maxWidth: '400px',
    padding: theme.spacing(1)
  },
  bottomControlsSliderLabel: {
    whiteSpace: 'nowrap',
    padding: theme.spacing(1)
  }
});

// the defaultMaxVolumeSize is the diameter of the largest
// volume in a dataset, in pixels.
const defaultMaxVolumeSize = 100000;

function objectMap(object, mapFn) {
  return Object.keys(object).reduce((result, key) => {
    result[key] = mapFn(object[key]); // eslint-disable-line no-param-reassign
    return result;
  }, {});
}

class SkeletonView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sharkViewer: null,
      sharkViewerSynapseRadius: 0,
      db: new PouchDB('neuprint_compartments'),
      bodies: Immutable.Map({}),
      compartments: Immutable.Map({}),
      loading: Immutable.Map({}),
      showMenu: false,
      spindleView: false,
      synapsesOnTop: false,
      loadingError: null
    };
    this.skelRef = React.createRef();
  }

  componentDidMount() {
    const { query } = this.props;
    // check for neurons and compartments here and load them into the state
    if (query.pm.dataset) {
      if (query.pm.bodyIds) {
        const bodyIds = query.pm.bodyIds.toString().split(',');
        this.addSkeletons(bodyIds, query.pm.dataset);
      }
      if (query.pm.compartments) {
        const compIds = query.pm.compartments.split(',');
        this.addCompartments(compIds, query.pm.dataset);
      }
    }
    this.createShark();
  }

  componentDidUpdate(prevProps, prevState) {
    const { query, synapses, synapseRadius } = this.props;
    // TODO: check to see if the synapse selection has changed. If so, update
    // the viewer to show the changes.
    const { sharkViewer, bodies } = this.state;
    if (sharkViewer) {
      const synapseRadiusChanged = this.synapseRadiusDidChange(synapseRadius);
      if (!deepEqual(this.props, prevProps)) {
        // only perform actions here that alter the state, no rendering or props changes
        const { bodyIds = '', compartments: compartmentIds = '', dataset: dataSet } = query.pm;
        const {
          bodyIds: prevBodyIds = '',
          compartments: prevCompartmentIds = ''
        } = prevProps.query.pm;

        const bodyIdList = bodyIds
          .toString()
          .split(',')
          .filter(x => x);
        const prevBodyIdList = prevBodyIds
          .toString()
          .split(',')
          .filter(x => x);
        const compartmentIdList = compartmentIds
          .toString()
          .split(',')
          .filter(x => x);
        const prevCompartmentIdList = prevCompartmentIds
          .toString()
          .split(',')
          .filter(x => x);

        // remove bodies that are no longer in props
        const currentBodySet = new Set(bodyIdList);
        const missingBodies = prevBodyIdList.filter(bodyId => !currentBodySet.has(bodyId));
        missingBodies.forEach(missingId => {
          this.removeSkeleton(missingId);
        });

        // Compare items in prevProps.synapse with props.synapse to figure out which inputs
        // have been removed.
        // If the synapse radius changed, there is no need to render when unloading synapses
        // because rendering will happen when the synapses are loaded with the new radius.
        const render = !synapseRadiusChanged;
        prevProps.synapses.forEach((value, bodyId) => {
          value.get('inputs', Immutable.Map({})).forEach((status, inputId) => {
            const currentColor = synapses.getIn([bodyId, 'inputs', inputId, 'color']);
            let colorChanged = false;
            if (currentColor && status.color !== currentColor) {
              colorChanged = true;
            }
            if (
              synapseRadiusChanged ||
              !synapses.getIn([bodyId, 'inputs', inputId]) ||
              colorChanged
            ) {
              this.unloadSynapse(bodyId, inputId, render);
            }
          });
          value.get('outputs', Immutable.Map({})).forEach((status, outputId) => {
            const currentColor = synapses.getIn([bodyId, 'outputs', outputId, 'color']);
            let colorChanged = false;
            if (currentColor && status.color !== currentColor) {
              colorChanged = true;
            }
            if (
              synapseRadiusChanged ||
              !synapses.getIn([bodyId, 'outputs', outputId]) ||
              colorChanged
            ) {
              this.unloadSynapse(bodyId, outputId, render);
            }
          });
        });

        // remove compartments that are no longer in props
        const currentCompartmentSet = new Set(compartmentIdList);
        const missingCompartments = prevCompartmentIdList.filter(
          compartmentId => !currentCompartmentSet.has(compartmentId)
        );
        this.removeCompartmentsFromState(missingCompartments);

        // load bodies that are new
        const prevBodySet = new Set(prevBodyIdList);
        const newBodyIds = bodyIdList.filter(bodyId => !prevBodySet.has(bodyId));
        this.addSkeletons(newBodyIds, query.pm.dataset);

        // load compartments that are new
        const prevCompartmentSet = new Set(prevCompartmentIdList);
        const newCompartmentIds = compartmentIdList.filter(
          compartmentId => !prevCompartmentSet.has(compartmentId)
        );
        this.addCompartments(newCompartmentIds, dataSet);
      }

      // render synapses that are new, ie those that are in props, but not prevProps
      synapses.forEach((value, bodyId) => {
        const isVisible = bodies.get(bodyId, Immutable.Map({})).get('visible');

        value.get('inputs', Immutable.Map({})).forEach((inputMeta, inputId) => {
          if (isVisible) {
            this.renderSynapse(bodyId, inputId, inputMeta, false, synapseRadiusChanged);
          } else {
            this.unloadSynapse(bodyId, inputId);
          }
        });
        value.get('outputs', Immutable.Map({})).forEach((outputMeta, outputId) => {
          if (isVisible) {
            this.renderSynapse(bodyId, outputId, outputMeta, false, synapseRadiusChanged);
          } else {
            this.unloadSynapse(bodyId, outputId);
          }
        });
      });

      // sharkViewer must rerender if the synapses-on-top toggle is all that changed
      if (query.sot !== prevProps.query.sot) {
        sharkViewer.setValues({ onTop: query.sot });
        sharkViewer.render();
      }

      if (!deepEqual(this.state, prevState)) {
        // only perform actions here that update the canvas rendering.
        const { compartments } = this.state;
        const { bodies: prevBodies, compartments: prevCompartments } = prevState;

        // un-render missing bodies
        const currentBodies = new Set(Object.keys(bodies.toJS()));
        const missingBodies = Object.keys(prevBodies.toJS()).filter(
          bodyId => !currentBodies.has(bodyId)
        );
        missingBodies.forEach(bodyId => {
          this.unloadBody(bodyId);
        });
        // un-render hidden bodies
        bodies
          .filter(body => !body.get('visible'))
          .forEach(body => {
            this.unloadBody(body.get('name'));
          });

        // un-render missing compartments
        const currentCompartments = new Set(Object.keys(compartments.toJS()));
        const missingCompartments = Object.keys(prevCompartments.toJS()).filter(
          compId => !currentCompartments.has(compId)
        );
        missingCompartments.forEach(compId => {
          this.unloadCompartment(compId);
        });

        // render new bodies
        const prevBodiesSet = new Set(Object.keys(prevBodies.toJS()));
        const newBodyIds = Object.keys(bodies.toJS()).filter(bodyId => !prevBodiesSet.has(bodyId));

        // move the camera only if there are no coordinates in the url and
        // this is the first body to be added to the scene.
        const moveCamera = !query.pm.coordinates && prevBodiesSet.size < 1;

        this.renderBodies(newBodyIds, moveCamera);

        // render bodies made visible again
        bodies
          .filter(body => body.get('visible'))
          .forEach(body => {
            this.renderBodies([body.get('name')]);
          });

        // render bodies that changed color
        bodies
          .filter(body => body.get('color') !== prevBodies.getIn([body.get('name'), 'color']))
          .forEach(body => {
            this.renderBodies([body.get('name')], false, true);
          });

        // render new compartments
        const prevCompartmentSet = new Set(Object.keys(prevCompartments.toJS()));
        const newCompartments = compartments.filter(
          compartment => !prevCompartmentSet.has(compartment.get('name'))
        );
        this.renderCompartments(newCompartments);
      }

      // the axis lines are the first child element added to the scene
      // so we can toggle the visibility of them this way.
      sharkViewer.axesScene.children.forEach(child => {
        child.visible = !query.ax // eslint-disable-line no-param-reassign
        return null;
      });

      if (query.sp !== prevProps.query.sp) {
        bodies.forEach(bodyId => {
          // unload all the bodies
          this.unloadBody(bodyId.get('name'));
          // reload all the bodies
          this.renderBodies([bodyId.get('name')]);
        });
      }
    }
  }

  componentWillUnmount() {
    const { sharkViewer } = this.state;
    const { actions, query, index } = this.props;

    if (query.pm && query.pm.bodyIds) {
      const bodyIds = query.pm.bodyIds.toString().split(',');
      // Set the correct query string to store the camera position.
      // TODO: we need to do this every time the camera position is changed,
      // otherwise camera position will be lost on page refresh.
      if (bodyIds.length > 0) {
        const coords = sharkViewer.cameraCoords();
        const target = sharkViewer.cameraTarget();

        const coordinateString = `${coords.x},${coords.y},${coords.z},${target.x},${target.y},${target.z}`;
        const tabData = actions.getQueryObject('qr', []);
        // if we have switched tabs and not removed the skeleton tab then we
        // need to keep track of the camera position.
        if (tabData[index]) {
          tabData[index].pm.coordinates = coordinateString;
          actions.setQueryString({
            qr: tabData
          });
        }
      }
    }
  }

  createShark = () => {
    const { query, datasetInfo } = this.props;

    // check for maxVolumeSize in datasetInfo
    let maxVolumeSize = defaultMaxVolumeSize;
    if (datasetInfo && datasetInfo[query.ds] && datasetInfo[query.ds].maxVolumeSize) {
      maxVolumeSize = datasetInfo[query.ds].maxVolumeSize;
    }

    import('@janelia/sharkviewer').then(SharkViewer => {
      const sharkViewer = new SharkViewer.default({ // eslint-disable-line new-cap
        dom_element: 'skeletonviewer',
        showAxes: 10000,
        flip: true,
        maxVolumeSize,
        WIDTH: this.skelRef.current.clientWidth,
        HEIGHT: this.skelRef.current.clientHeight,
        // on_select_node: (id, sampleNumber, event, coords) => { console.log(id, sampleNumber, event, coords) },
        on_toggle_node: id => {
          this.handleClick(id);
        }
      });
      sharkViewer.init();
      sharkViewer.animate();

      if (query.pm.coordinates) {
        const coords = query.pm.coordinates.split(',');
        const target = {
          x: parseFloat(coords[3]),
          y: parseFloat(coords[4]),
          z: parseFloat(coords[5])
        };
        sharkViewer.restoreView(
          parseFloat(coords[0]),
          parseFloat(coords[1]),
          parseFloat(coords[2]),
          target
        );
      }

      sharkViewer.render();
      sharkViewer.render();
      this.setState({ sharkViewer });
      // UGLY: there is a weird bug that means sometimes the scene is rendered blank.
      // it seems to be some sort of timing issue, and adding a delayed render seems
      // to fix it.
      setTimeout(() => {
        sharkViewer.render();
      }, 200);
    });
  };

  handleDelete = id => {
    const { actions, query, index } = this.props;
    const { bodies } = this.state;
    const updated = bodies.delete(id);
    this.setState({ bodies: updated });
    actions.skeletonRemove(id, query.pm.dataset, index);
    // action passed in from Results that removes id from the url
  };

  handleShowMenu = () => {
    const { showMenu } = this.state;
    this.setState({ showMenu: !showMenu });
  };

  handleShowAll = () => {
    const { bodies } = this.state;
    // loop over all the bodies and set visible to true
    const updated = bodies.map(body => body.set('visible', true));
    //
    this.setState({ bodies: updated });
  };

  handleHideAll = () => {
    const { bodies } = this.state;
    // loop over all the bodies and set visible to true
    const updated = bodies.map(body => body.set('visible', false));
    //
    this.setState({ bodies: updated });
  };

  handleClick = id => {
    const { bodies } = this.state;
    const visible = !bodies.getIn([id, 'visible']);
    const updated = bodies.setIn([id, 'visible'], visible);
    this.setState({ bodies: updated });
  };

  handleChangeColor = (id, color) => {
    const { db, bodies } = this.state;
    db.get(`sk_${id}`)
      .then(doc => {
        const updated = doc;
        updated.color = color;
        return db.put(updated);
      })
      .then(() => {
        // update the skeleton color in the state
        const updated = bodies.setIn([id, 'color'], color);
        this.setState({ bodies: updated });
      });
  };

  handleResetKey = e => {
    if (e.key === 'r' && !e.metaKey && !e.shiftKey) {
      this.handleReset();
    }
  };

  handleReset = () => {
    // reset the view to the original view when the first neuron was loaded?
    // pick the first neuron in the scene and center the camera around that?
    const { sharkViewer } = this.state;
    sharkViewer.resetAroundFirstNeuron();
  };

  addCompartment = (id, dataSet) => {
    if (id === '') {
      return;
    }
    const { neo4jsettings, actions } = this.props;
    const { uuid } = neo4jsettings.get('datasetInfo')[dataSet];

    if (uuid) {
      fetch(`/api/roimeshes/mesh/${dataSet}/${id}`, {
        headers: {
          'Content-Type': 'text/plain',
          Accept: 'application/json'
        },
        method: 'GET',
        credentials: 'include'
      })
        .then(result => result.text())
        .then(result => {
          this.skeletonLoadedCompartment(id, result);
        })
        .catch(error => {
          this.setState({ loadingError: error });
          actions.metaInfoError('Failed to load mesh from server');
        });
    }
  };

  updateCompartments = updated => {
    const { actions, index } = this.props;
    const tabData = actions.getQueryObject('qr', []);
    tabData[index].pm.compartments = updated.join(',');
    actions.setQueryString({
      qr: tabData
    });
  };

  handleSpindleToggle = () => {
    const { actions, index } = this.props;
    actions.toggleSpindle(index);
  };

  handleAxisLines = () => {
    const { actions, index } = this.props;
    actions.toggleAxisLines(index);
  };

  handleSynapsesOnTopToggle = () => {
    const { actions, index } = this.props;
    actions.toggleSynapsesOnTop(index);
  };

  handleSynapseSizeChange = (event, value) => {
    const { actions, index } = this.props;
    actions.setSynapseRadius(value, index);
  };

  unloadCompartment(id) {
    const { sharkViewer } = this.state;
    sharkViewer.unloadCompartment(id);
    sharkViewer.render();
    sharkViewer.render();
    // UGLY: there is a weird bug that means sometimes the scene is rendered blank.
    // it seems to be some sort of timing issue, and adding a delayed render seems
    // to fix it.
    setTimeout(() => {
      sharkViewer.render();
    }, 200);
  }

  unloadBody(id) {
    const { sharkViewer } = this.state;
    sharkViewer.unloadNeuron(id);
    sharkViewer.render();
    sharkViewer.render();
    // UGLY: there is a weird bug that means sometimes the scene is rendered blank.
    // it seems to be some sort of timing issue, and adding a delayed render seems
    // to fix it.
    setTimeout(() => {
      sharkViewer.render();
    }, 200);
  }

  unloadSynapse(bodyId, synapseId, render = true) {
    const { sharkViewer } = this.state;
    const name = `${bodyId}_${synapseId}`;
    sharkViewer.unloadNeuron(name, true);
    if (render) {
      sharkViewer.render();
      sharkViewer.render();
      // UGLY: there is a weird bug that means sometimes the scene is rendered blank.
      // it seems to be some sort of timing issue, and adding a delayed render seems
      // to fix it.
      setTimeout(() => {
        sharkViewer.render();
      }, 200);
    }
  }

  removeCompartmentsFromState(ids) {
    const { compartments } = this.state;
    const updated = compartments.deleteAll(ids);
    this.setState({ compartments: updated });
    return updated;
  }

  addCompartments(cIds, dataSet) {
    cIds.forEach(id => {
      this.addCompartment(id, dataSet);
    });
  }

  skeletonLoadedCompartment(id, result) {
    const { db, compartments } = this.state;
    const compartment = Immutable.Map({
      name: id,
      obj: 'localStorage',
      visible: true,
      color: '#000000'
    });
    return db
      .putAttachment(id, 'obj', btoa(result), 'text/plain')
      .then(() => {
        const updated = compartments.set(id, compartment);
        this.setState({ compartments: updated });
      })
      .catch(err => {
        if (err.name === 'conflict') {
          const updated = compartments.set(id, compartment);
          this.setState({ compartments: updated });
        } else {
          this.setState({
            loadingError: err
          });
        }
      });
  }

  addSkeleton(bodyId, dataSet) {
    if (bodyId === '') {
      return;
    }

    const { actions } = this.props;
    // TODO: check if we have a cached copy of the data and skip the fetch if we do.
    // document key should be sk_<id>
    //
    // we can fetch the timestamps with the following neuprint cypher query:
    // WITH [1,2] AS ids MATCH (n:`mb6-Neuron`)-[:Contains]->(s:Skeleton) WHERE n.bodyId IN ids RETURN n.bodyId,s.timeStamp
    // That will return the timestamps for each of the neurons, then if it is different or blank,
    // we fetch the swc data.

    // fetch swc data
    fetch(`/api/skeletons/skeleton/${dataSet}/${bodyId}`, {
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      method: 'GET',
      credentials: 'include'
    })
      .then(result => {
        if (result.status === 401) {
          throw Error('Unauthorized');
        }
        return result.json();
      })
      .then(result => {
        if ('error' in result) {
          throw Error(result.error);
        }
        this.skeletonLoaded(bodyId, dataSet, result);
      })
      .catch(error => {
        this.setState({ loadingError: error.message });
        if (error.message === 'Unauthorized') {
          // if we get here, then need to force login again.
          actions.metaInfoError('Login Expired. Please sign in again.');
          actions.logoutUser();
          window.location = '/';
        } else {
          actions.metaInfoError('Failed to load skeleton from server.');
        }
      });
  }

  addSkeletons(bodyIds, dataSet) {
    bodyIds.forEach(id => {
      this.addSkeleton(id, dataSet);
    });
  }

  skeletonLoaded(id, dataSet, result) {
    const { db } = this.state;
    // parse the result into swc format for skeleton viewer code.
    const data = {};

    result.data.forEach(row => {
      data[parseInt(row[0], 10)] = {
        x: parseInt(row[1], 10),
        y: parseInt(row[2], 10),
        z: parseInt(row[3], 10),
        radius: parseInt(row[4], 10),
        parent: parseInt(row[5], 10)
      };
    });

    // check to see if we have a color cached for this neuron.
    // if yes, then return the color,
    // else, generate random color and cache it.
    db.get(`sk_${id}`)
      .then(doc => {
        const { color } = doc;
        this.addSkeletonToState(id, dataSet, data, color);
      })
      .catch(() => {
        const color = randomColor({ luminosity: 'light', hue: 'random' });
        db.put({
          _id: `sk_${id}`,
          color
        }).then(() => {
          this.addSkeletonToState(id, dataSet, data, color);
        });
      });
  }

  addSkeletonToState(id, dataSet, data, color) {
    const { bodies } = this.state;

    const updated = bodies.set(
      id,
      Immutable.Map({
        name: id,
        dataSet,
        swc: data,
        color,
        visible: true
      })
    );
    this.setState({ bodies: updated });
  }

  removeSkeleton(id) {
    const { bodies } = this.state;
    const updated = bodies.delete(id);
    this.setState({ bodies: updated });
  }

  synapseRadiusDidChange(newRadius) {
    const { sharkViewerSynapseRadius } = this.state;
    if (newRadius !== sharkViewerSynapseRadius) {
      // Save in the state the radius that is used to create the data passed to sharkViewer.
      // Doing so makes it possible to detect when that radius has changed and the data
      // needs to be passed again.  Trying to detect the change by only comparing props
      // does not always work, since componentDidUpdate sometimes waits for sharkViewer
      // to be created.
      this.setState({ sharkViewerSynapseRadius: newRadius });
      return true;
    }
    return false;
  }

  renderSynapse(bodyId, synapseId, synapseData, moveCamera = false, radiusChange = false) {
    const { sharkViewer, bodies } = this.state;
    const { synapseRadius } = this.props;
    const name = `${bodyId}_${synapseId}`;
    const exists = sharkViewer.neuronLoaded(name, true);
    const isVisible = bodies.get(bodyId).get('visible');

    if (!exists && isVisible) {
      const swc = radiusChange
        ? objectMap(synapseData.swc, value => {
            const updatedValue = value;
            updatedValue.radius = synapseRadius;
            return updatedValue;
          })
        : synapseData.swc;
      sharkViewer.loadNeuron(name, synapseData.color, swc, moveCamera, true, true);
      sharkViewer.setNeuronVisible(name, isVisible);
      sharkViewer.render();
      sharkViewer.render();
      // UGLY: there is a weird bug that means sometimes the scene is rendered blank.
      // it seems to be some sort of timing issue, and adding a delayed render seems
      // to fix it.
      setTimeout(() => {
        sharkViewer.render();
      }, 200);
    } else if (exists && !isVisible) {
      // the neuron has been hidden, so hide the synapses as well.
      sharkViewer.unloadNeuron(name);
      sharkViewer.render();
      setTimeout(() => {
        sharkViewer.render();
      }, 200);
    }
  }

  renderBodies(ids, moveCamera = false, colorChange = false) {
    const { sharkViewer, bodies } = this.state;
    const { query } = this.props;
    ids.forEach(id => {
      const body = bodies.get(id);

      const swc = query.sp
        ? /* The JSON.parse(JSON.stringify(object)) call in the following code is needed to
           * create a deep clone of the object, referenced here as 'Native deep cloning':
           * https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
           * It can be used since we are using only numbers and strings in our swc object.
           * Removing this would cause us to update the original object and then we would
           * no longer be able to revert back to the original swc file with variable radii
           * for the synapses.
           */
          objectMap(JSON.parse(JSON.stringify(body.get('swc'))), value => {
            const updatedValue = value;
            updatedValue.radius = 1;
            return updatedValue;
          })
        : body.get('swc');

      // If added, then add them to the scene.
      const exists = sharkViewer.neuronLoaded(body.get('name'));
      if (!exists) {
        sharkViewer.loadNeuron(body.get('name'), body.get('color'), swc, moveCamera, false, true);
      }
      if (colorChange) {
        this.unloadBody(body.get('name'));
        sharkViewer.loadNeuron(body.get('name'), body.get('color'), swc, moveCamera, false, true);
      }
      // if hidden, then hide them.
      sharkViewer.setNeuronVisible(body.get('name'), body.get('visible'));
    });
    sharkViewer.render();
    sharkViewer.render();
    // UGLY: there is a weird bug that means sometimes the scene is rendered blank.
    // it seems to be some sort of timing issue, and adding a delayed render seems
    // to fix it.
    setTimeout(() => {
      sharkViewer.render();
    }, 200);
  }

  renderCompartments(rois) {
    const { sharkViewer, db } = this.state;
    const moveCamera = false;
    rois.forEach(roi => {
      const exists = sharkViewer.compartmentLoaded(roi.get('name'));
      if (!exists) {
        const reader = new FileReader();

        reader.addEventListener('loadend', () => {
          sharkViewer.loadCompartment(roi.get('name'), roi.get('color'), reader.result, moveCamera);
        });

        db.getAttachment(roi.get('name'), 'obj').then(obj => {
          reader.readAsText(obj);
        });
      }
    });
  }

  render() {
    const { classes, query, neo4jsettings, synapses, synapseRadius, hideControls } = this.props;

    const { showMenu } = this.state;

    const { compartments = '' } = query.pm;

    const compartmentIds = compartments.split(',').filter(x => x);

    const { bodies } = this.state;

    const chips = bodies.map(neuron => {
      // gray out the chip if it is not active.
      let currcolor = neuron.get('color');
      if (!neuron.get('visible')) {
        currcolor = '#aaa';
      }

      const name = neuron.get('name');

      return (
        <Chip
          key={name}
          label={name}
          onDelete={() => this.handleDelete(name.toString())}
          onClick={this.handleShowMenu}
          className={classes.chip}
          style={{
            background: currcolor,
            color: pickTextColorBasedOnBgColorAdvanced(currcolor, '#fff', '#000')
          }}
        />
      );
    });

    const chipsArray = chips.valueSeq().toArray();

    // pass action callbacks to add or remove compartments to
    // the compartment selection component.
    const compartmentActions = {
      setROIs: this.updateCompartments
    };

    const compartmentSelection = (
      <CompartmentSelection
        availableROIs={neo4jsettings.get('availableROIs')}
        superROIs={neo4jsettings.get('superROIs')}
        selectedROIs={compartmentIds}
        dataSet={query.pm.dataset}
        actions={compartmentActions}
      />
    );

    const spindleChecked = Boolean(query.sp);
    const AxisChecked = !query.ax;
    const synapsesOnTopChecked = Boolean(query.sot);

    // the synapses map never loses keys, so there are no synapses shown when
    // each of those keys is associated with nothing
    let areSynapses = false;
    synapses.forEach(value => {
      const ins = value.get('inputs');
      if (ins !== undefined && ins.count() > 0) {
        areSynapses = true;
      }
      const outs = value.get('outputs');
      if (outs !== undefined && outs.count() > 0) {
        areSynapses = true;
      }
    });

    const bottomControls = (
      <FormGroup row>
        <Button
          className={classes.resetButton}
          variant="outlined"
          color="primary"
          onClick={this.handleReset}
        >
          Reset View
        </Button>
        <FormControlLabel
          control={
            <Switch onChange={this.handleSpindleToggle} checked={spindleChecked} color="primary" />
          }
          label="Spindle View"
        />
        <FormControlLabel
          control={<Switch onChange={this.handleAxisLines} checked={AxisChecked} color="primary" />}
          label="Axis Lines"
        />
        {areSynapses && (
          <>
            <FormControlLabel
              control={
                <Switch
                  onChange={this.handleSynapsesOnTopToggle}
                  checked={synapsesOnTopChecked}
                  color="primary"
                />
              }
              label="Synapses On Top"
            />
            <span className={classes.bottomControlsSlider}>
              <Slider
                value={synapseRadius}
                valueLabelDisplay="auto"
                onChange={this.handleSynapseSizeChange}
                min={MinSynapseRadius}
                max={MaxSynapseRadius}
                step={1}
                color="primary"
              />
              <span className={classes.bottomControlsSliderLabel}>Synapse Size</span>
            </span>
          </>
        )}
      </FormGroup>
    );

    if (hideControls) {
      return (
        <div className={classes.root}>
          <div className={classes.skel} ref={this.skelRef} id="skeletonviewer" />
        </div>
      );
    }

    /* eslint-disable jsx-a11y/no-static-element-interactions */
    return (
      <div className={classes.root} onKeyDown={this.handleResetKey}>
        {!showMenu && <div className={classes.floater}>{chipsArray}</div>}
        <ActionDrawer
          bodies={bodies}
          open={showMenu}
          showHandler={this.handleShowMenu}
          bodyHideHandler={this.handleClick}
          bodyDeleteHandler={this.handleDelete}
          handleChangeColor={this.handleChangeColor}
          synapseRadius={synapseRadius}
          showAll={this.handleShowAll}
          hideAll={this.handleHideAll}
        />
        <div className={classes.compartments}>{compartmentSelection}</div>
        <div className={classes.bottomControls}>{bottomControls}</div>
        <div className={classes.skel} ref={this.skelRef} id="skeletonviewer" />
      </div>
    );
    /* eslint-enable jsx-a11y/no-static-element-interactions */
  }
}

SkeletonView.propTypes = {
  query: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  neo4jsettings: PropTypes.object.isRequired,
  datasetInfo: PropTypes.object.isRequired,
  synapses: PropTypes.object.isRequired,
  hideControls: PropTypes.bool,
  synapseRadius: PropTypes.number.isRequired
};

SkeletonView.defaultProps = {
  hideControls: false
};

export default withStyles(styles)(SkeletonView);
