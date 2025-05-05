import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Snackbar from '@mui/material/Snackbar';
import Fade from '@mui/material/Fade';

import { clearNotification } from '../actions/app';

class Notification extends React.Component {
  handleClose = () => {
    const { actions } = this.props;
    actions.clearNotification();
  };

  render() {
    const { notificationMessage } = this.props;
    return (
      <Snackbar
        open={notificationMessage !== null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={this.handleClose}
        TransitionComponent={Fade}
        ContentProps={{
          'aria-describedby': 'message-id'
        }}
        message={<span id="message-id">{notificationMessage}</span>}
        autoHideDuration={2000}
      />
    );
  }
}

Notification.propTypes = {
  notificationMessage: PropTypes.string,
  actions: PropTypes.object.isRequired
};

Notification.defaultProps = {
  notificationMessage: null
};

const NotificationState = state => ({
  notificationMessage: state.notification.get('message')
});

const NotificationDispatch = dispatch => ({
  actions: {
    clearNotification: () => {
      dispatch(clearNotification());
    }
  }
});

export default connect(
  NotificationState,
  NotificationDispatch
)(Notification);
