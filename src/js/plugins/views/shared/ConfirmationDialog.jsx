import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

class ConfirmationDialog extends React.Component {

  getLocalStorageKey = () => {
    const { dataSet } = this.props;
    // Version the key to invalidate stale localStorage when column structure changes
    const baseKey = 'neuprint-column-selections-v2';
    console.log('getLocalStorageKey', baseKey, dataSet);
    return dataSet ? `${baseKey}-${dataSet}` : baseKey;
  };

  componentDidMount() {
    this.loadColumnSelections();
  }

  loadColumnSelections = () => {
    try {
      const saved = localStorage.getItem(this.getLocalStorageKey());
      if (saved) {
        const selections = JSON.parse(saved);
        const { columns } = this.props;

        // Validate that selections is an object
        if (!selections || typeof selections !== 'object') {
          console.warn('Invalid column selections in localStorage, ignoring');
          return;
        }

        columns.forEach((column, index) => {
          if (!column.hidden && selections.hasOwnProperty(column.name)) {
            const shouldBeSelected = selections[column.name];
            // Only apply if it's a boolean value
            if (typeof shouldBeSelected === 'boolean' && column.status !== shouldBeSelected) {
              this.props.onChange(index);
            }
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load column selections from localStorage:', error);
      // Clear corrupted localStorage
      try {
        localStorage.removeItem(this.getLocalStorageKey());
      } catch (e) {
        // Ignore if we can't clear it
      }
    }
  };

  saveColumnSelections = () => {
    try {
      const { columns } = this.props;
      const selections = {};

      columns.forEach(column => {
        if (!column.hidden) {
          selections[column.name] = column.status;
        }
      });

      localStorage.setItem(this.getLocalStorageKey(), JSON.stringify(selections));
    } catch (error) {
      console.warn('Failed to save column selections to localStorage:', error);
    }
  };

  handleOk = () => {
    const { onConfirm } = this.props;
    this.saveColumnSelections();
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

  handleRestoreDefaults = () => {
    try {
      localStorage.removeItem(this.getLocalStorageKey());
      window.location.reload();
    } catch (error) {
      console.warn('Failed to restore defaults:', error);
    }
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
          <Button onClick={this.handleRestoreDefaults} color="primary">
            Restore Defaults
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
  onChange: PropTypes.func.isRequired,
  dataSet: PropTypes.string
};

export default ConfirmationDialog;
