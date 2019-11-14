import React from 'react';
import PropTypes from 'prop-types';
import randomColor from 'randomcolor';
import Immutable from 'immutable';
import PouchDB from 'pouchdb';
import deepEqual from 'deep-equal';

// TODO: Advance the version of Material-UI to get Slider from core.
import Slider from '@material-ui/lab/Slider';

import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';

import { MinSynapseRadius, MaxSynapseRadius } from 'actions/skeleton';

import ActionMenu from './Skeleton/ActionMenu';

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
    padding: theme.spacing.unit,
    position: 'absolute',
    display: 'flex', // keeps the chips in a vertical column instead of a row.
    flexDirection: 'column'
  },
  compartments: {
    zIndex: 2,
    padding: theme.spacing.unit,
    position: 'absolute',
    top: 0,
    right: 0
  },
  skel: {
    width: '100%',
    height: '100%',
    background: '#ddd',
    zIndex: 1,
    position: 'relative'
  },
  chip: {
    margin: theme.spacing.unit / 2
  },
  minimize: {
    zIndex: 2,
    position: 'absolute',
    top: '1em',
    right: '1em'
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
    padding: theme.spacing.unit
  },
  bottomControlsSliderLabel: {
    whiteSpace: 'nowrap',
    padding: theme.spacing.unit
  }
});

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
      spindleView: false,
      synapsesOnTop: false
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
    const { sharkViewer } = this.state;
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
            if (synapseRadiusChanged || !synapses.getIn([bodyId, 'inputs', inputId])) {
              this.unloadSynapse(bodyId, inputId, render);
            }
          });
          value.get('outputs', Immutable.Map({})).forEach((status, outputId) => {
            if (synapseRadiusChanged || !synapses.getIn([bodyId, 'outputs', outputId])) {
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
        value.get('inputs', Immutable.Map({})).forEach((inputMeta, inputId) => {
          this.renderSynapse(bodyId, inputId, inputMeta, false, synapseRadiusChanged);
        });
        value.get('outputs', Immutable.Map({})).forEach((outputMeta, outputId) => {
          this.renderSynapse(bodyId, outputId, outputMeta, false, synapseRadiusChanged);
        });
      });

      // sharkViewer must rerender if the synapses-on-top toggle is all that changed
      if (query.sot !== prevProps.query.sot) {
        sharkViewer.setValues({ onTop: query.sot });
        sharkViewer.render();
      }

      if (!deepEqual(this.state, prevState)) {
        // only perform actions here that update the canvas rendering.
        const { bodies, compartments } = this.state;
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

        const moveCamera = !query.pm.coordinates;

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

      if (query.sp !== prevProps.query.sp) {
        const { bodies } = this.state;
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

        const coordinateString = `${coords.x},${coords.y},${coords.z},${target.x},${target.y},${
          target.z
        }`;
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
    const { query } = this.props;
    import('@janelia/sharkviewer').then(SharkViewer => {
      const sharkViewer = new SharkViewer.default({ // eslint-disable-line new-cap
        dom_element: 'skeletonviewer',
        WIDTH: this.skelRef.current.clientWidth,
        HEIGHT: this.skelRef.current.clientHeight,
        // on_select_node: (id, sampleNumber, event, coords) => { console.log(id, sampleNumber, event, coords) },
        on_toggle_node: (id) => { this.handleClick(id) }
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

  handleClick = (id) => {
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

  addCompartment = (id, dataSet) => {
    if (id === '') {
      return;
    }
    const { neo4jsettings } = this.props;
    const meshHost = neo4jsettings.get('meshInfo')[dataSet];
    const { uuid } = neo4jsettings.get('datasetInfo')[dataSet];

    if (meshHost && uuid) {
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
        .catch(error => this.setState({ loadingError: error }));
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

  handleSynapsesOnTopToggle = () => {
    const { actions, index } = this.props;
    actions.toggleSynapsesOnTop(index);
  }

  handleSynapseSizeChange = (event, value) => {
    const { actions, index } = this.props;
    actions.setSynapseRadius(value, index);
  }

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
      .then(result => result.json())
      .then(result => {
        if ('error' in result) {
          throw result.error;
        }
        this.skeletonLoaded(bodyId, dataSet, result);
      })
      .catch(error => this.setState({ loadingError: error }));
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

  removeOutput(bodyId, outputId) {
    const { outputs } = this.state;
    const updated = outputs.deleteIn([bodyId, 'outputs', outputId]);
    this.setState({ outputs: updated });
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
    const { sharkViewer } = this.state;
    const { synapseRadius } = this.props;
    const name = `${bodyId}_${synapseId}`;
    const exists = sharkViewer.neuronLoaded(name, true);
    if (!exists) {
      const swc = radiusChange
        ? objectMap(synapseData.swc, value => {
            const updatedValue = value;
            updatedValue.radius = synapseRadius;
            return updatedValue;
          })
        : synapseData.swc;
      sharkViewer.loadNeuron(name, synapseData.color, swc, moveCamera, true);
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

  renderBodies(ids, moveCamera = false, colorChange = false) {
    const { sharkViewer, bodies } = this.state;
    const { query } = this.props;
    ids.forEach(id => {
      const body = bodies.get(id);

      const swc = query.sp
        ? objectMap(JSON.parse(JSON.stringify(body.get('swc'))), value => {
            const updatedValue = value;
            updatedValue.radius = 1;
            return updatedValue;
          })
        : body.get('swc');

      // If added, then add them to the scene.
      const exists = sharkViewer.neuronLoaded(body.get('name'));
      if (!exists) {
        sharkViewer.loadNeuron(body.get('name'), body.get('color'), swc, moveCamera);
      }
      if (colorChange) {
        this.unloadBody(body.get('name'));
        sharkViewer.loadNeuron(body.get('name'), body.get('color'), swc, moveCamera);
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
    const { classes, query, neo4jsettings, synapses, synapseRadius } = this.props;

    const { compartments = '' } = query.pm;

    const compartmentIds = compartments.split(',').filter(x => x);

    const { bodies } = this.state;

    const chips = bodies.map(neuron => {
      // gray out the chip if it is not active.
      let currcolor = neuron.get('color');
      if (!neuron.get('visible')) {
        currcolor = 'gray';
      }

      const name = neuron.get('name');

      return (
        <ActionMenu
          key={name}
          color={currcolor}
          synapseRadius={synapseRadius}
          dataSet={query.pm.dataset}
          isVisible={neuron.get('visible')}
          body={neuron}
          handleDelete={this.handleDelete}
          handleClick={this.handleClick}
          handleChangeColor={this.handleChangeColor}
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
        selectedROIs={compartmentIds}
        dataSet={query.pm.dataset}
        actions={compartmentActions}
      />
    );

    const spindleChecked = Boolean(query.sp);
    const synapsesOnTopChecked = Boolean(query.sot);

    // the synapses map never loses keys, so there are no synapses shown when 
    // each of those keys is associated with nothing
    let areSynapses = false;
    synapses.forEach((value) => {
      const ins = value.get('inputs');
      if ((ins !== undefined) && (ins.count() > 0)) {
        areSynapses = true;
      }
      const outs = value.get('outputs');
      if ((outs !== undefined) && (outs.count() > 0)) {
        areSynapses = true;
      }
    });

    const bottomControls = (
      <FormGroup row>
        <FormControlLabel
          control={
            <Switch onChange={this.handleSpindleToggle} checked={spindleChecked} color="primary" />
          }
          label="Spindle View"
        />
        {areSynapses &&
          <React.Fragment>
            <FormControlLabel
              control={
                <Switch onChange={this.handleSynapsesOnTopToggle} checked={synapsesOnTopChecked} color="primary" />
              }
              label="Synapses On Top"
            />
            <span className={classes.bottomControlsSlider} >
              <Slider 
                value={synapseRadius}
                onChange={this.handleSynapseSizeChange}         
                min={MinSynapseRadius} 
                max={MaxSynapseRadius} 
                step={1} 
                color="primary" />
              <span className={classes.bottomControlsSliderLabel} >
                Synapse Size
              </span>
            </span>
          </React.Fragment>
        }
      </FormGroup>
    );

    return (
      <div className={classes.root}>
        <div className={classes.floater}>{chipsArray}</div>
        <div className={classes.compartments}>{compartmentSelection}</div>
        <div className={classes.bottomControls}>{bottomControls}</div>
        <div className={classes.skel} ref={this.skelRef} id="skeletonviewer" />
      </div>
    );
  }
}

SkeletonView.propTypes = {
  query: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  neo4jsettings: PropTypes.object.isRequired,
  synapses: PropTypes.object.isRequired,
  synapseRadius: PropTypes.number.isRequired
};

export default withStyles(styles)(SkeletonView);
