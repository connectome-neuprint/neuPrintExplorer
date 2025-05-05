import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@mui/material/Icon';
import Fab from '@mui/material/Fab';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  download: {
    position: 'absolute',
    right: theme.spacing(1),
    bottom: theme.spacing(1),
    zIndex: 100
  },
  container: {
    height: '100%'
  }
});

class Cytoscape extends React.Component {
  constructor(props) {
    super(props);
    this.cyRef = React.createRef();
  }

  componentDidMount() {
    // TODO: if saved node positions are found, then load them into the graph,
    // so that it can be restored. https://github.com/connectome-neuprint/neuPrintExplorerPlugins/issues/29
    this.build();
  }

  componentDidUpdate() {
    this.destroy();
    this.build();
  }

  componentWillUnmount() {
    // TODO: save the current position of all the nodes, so that they can be reloaded
    // if this graph is reloaded. https://github.com/connectome-neuprint/neuPrintExplorerPlugins/issues/29
    this.destroy();
  }

  handleDownload = () => {
    const exportData = JSON.stringify(this.cy.json());
    const element = document.createElement('a');
    const file = new Blob([exportData], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'graph.json';
    document.body.appendChild(element);
    element.click();
    setTimeout(() => {
      document.body.removeChild(element);
      URL.revokeObjectURL(file);
    }, 100);
  };

  build() {
    const { elements, style, layout } = this.props;
    // eslint-disable-next-line import/no-unresolved
    import('cytoscape').then(cytoscape => {
      this.cy = cytoscape.default({
        container: this.cyRef.current,
        elements,
        style,
        layout
      });
      // uncomment this for debugging in the console.
      // window.cy = this.cy;
    });
  }

  destroy() {
    if (this.cy) {
      this.cy.destroy();
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <>
        <div ref={this.cyRef} className={classes.container} />
        <Fab
          color="primary"
          className={classes.download}
          aria-label="Download data"
          onClick={() => {
            this.handleDownload();
          }}
        >
          <Icon style={{ fontSize: 18 }}>file_download</Icon>
        </Fab>
      </>
    );
  }
}

Cytoscape.propTypes = {
  elements: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  style: PropTypes.arrayOf(PropTypes.object).isRequired,
  layout: PropTypes.object.isRequired
};

export default withStyles(styles)(Cytoscape);
