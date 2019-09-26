import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  popover: {
    position: 'absolute',
    zIndex: 4000,
    background: '#fff',
    padding: '0.3em 1em',
    border: '1px solid #ccc',
    borderRadius: '5px'
  }
});

function ConnectivityPopOver(props) {
  const { contents, target, classes } = props;
  if (contents) {
    const coords = target.getBoundingClientRect();
    return (
      <div className={classes.popover} style={{ top: coords.y + 20, left: coords.x + 20 }}>
        <p>
          {contents.column} &rarr; {contents.row}
        </p>
        <p>{Math.round(contents.value)}</p>
        <p>{contents.label2}</p>
      </div>
    );
  }
  return <div />;
}

ConnectivityPopOver.defaultProps = {
  contents: null,
  target: null
};

ConnectivityPopOver.propTypes = {
  contents: PropTypes.object,
  target: PropTypes.object,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ConnectivityPopOver);
