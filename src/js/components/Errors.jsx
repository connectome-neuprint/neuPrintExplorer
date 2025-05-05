import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { withStyles } from '@material-ui/core/styles';

import { clearErrors } from '../actions/app';

const styles = theme => ({
  close: {
    padding: theme.spacing(0.5)
  }
});

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

class Errors extends React.Component {
  handleClose = () => {
    const { actions } = this.props;
    actions.clearErrors();
  }

  render() {
    const { classes, errorMessage } = this.props;
    return (
      <Snackbar
        open={errorMessage !== null}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={this.handleClose}
        TransitionComponent={TransitionDown}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">{errorMessage}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={this.handleClose}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />
    );
  }
}

Errors.propTypes = {
  errorMessage: PropTypes.string,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

Errors.defaultProps = {
  errorMessage: null
};

const ErrorsState = state => ({
  errorMessage: state.errors.get('message')
});

const ErrorsDispatch = dispatch => ({
  actions: {
    clearErrors: () => {
      dispatch(clearErrors());
    }
  }
});

export default withStyles(styles)(
  connect(
    ErrorsState,
    ErrorsDispatch
  )(Errors)
);
