import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';

class ConfirmationDialog extends React.Component {
  handleOk = () => {
    const { onConfirm } = this.props;
    onConfirm();
  };

  handleToggle = index => {
    const { onChange } = this.props;
    onChange(index);
  };

  handleSelectAll = () => {
    const { columns, onChange } = this.props;
    columns.forEach((column, index) => {
      if (column.hidden || column.status === true) {
        return;
      }
      onChange(index);
    });
  }

  handleSelectNone = () => {
    const { columns, onChange } = this.props;
    columns.forEach((column, index) => {
      if (column.hidden || column.status === false) {
        return;
      }
      onChange(index);
    });
  }


  render() {
    const { open, columns } = this.props;

    if (!open) {
      return null;
    }

    const options = columns.map((column, index) => {
      if (column.hidden) {
        return null;
      }
      return (
        <ListItem key={column.name} button onClick={() => this.handleToggle(index)}>
          <ListItemText primary={`${column.name}`} />
          <ListItemSecondaryAction>
            <Checkbox
              color="primary"
              onChange={() => this.handleToggle(index)}
              checked={column.status}
            />
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return (
      <Dialog
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
        open={open}
        onClose={this.handleOk}
      >
        <DialogTitle id="confirmation-dialog-title">Column Selection</DialogTitle>
        <DialogContent>
          <Button onClick={this.handleSelectAll} color="primary">
            Select All
          </Button>
          <Button onClick={this.handleSelectNone} color="primary">
            Clear All
          </Button>
          <List>{options}</List>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleOk} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  columns: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ConfirmationDialog;
