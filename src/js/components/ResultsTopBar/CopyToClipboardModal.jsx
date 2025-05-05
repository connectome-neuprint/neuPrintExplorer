import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

import copy from 'copy-to-clipboard';

class CopyToClipboardModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColumns: []
    };
  }

  handleCSV = () => {
    const { handleClose, callback } = this.props;
    const { selectedColumns } = this.state;
    const csv = callback(selectedColumns);
    const result = copy(csv);
    if (result) {
      handleClose();
    }
  };

  handleList = () => {
    const { handleClose, callback } = this.props;
    const { selectedColumns } = this.state;
    const csv = callback(selectedColumns);
    const list = csv.replace(/\n/g,',');
    const result = copy(list);
    if (result) {
      handleClose();
    }
  }



  handleToggle = index => {
    const { selectedColumns } = this.state;
    selectedColumns[index] = !selectedColumns[index];
    this.setState({ selectedColumns });
  };

  render() {
    const { open, visibleColumns, resultData, handleClose } = this.props;
    const { selectedColumns } = this.state;

    if (!open || !resultData) {
      return null;
    }

    let columnData = resultData.columns;

    if (resultData.data && resultData.data[0].columns) {
      columnData = resultData.data[0].columns;
    }

    const options = columnData.map((column, index) => {
      // if visible columns, check that the current column should be visible
      // and change the name if required.
      if (!visibleColumns || visibleColumns.size > 0) {
        const mappedColumn = visibleColumns.get(index);

        if (!mappedColumn.status) {
          return null;
        }

        return (
          <ListItem key={mappedColumn.name} button onClick={() => this.handleToggle(index)}>
            <ListItemText primary={`${mappedColumn.name}`} />
            <ListItemSecondaryAction>
              <Checkbox
                color="primary"
                onChange={() => this.handleToggle(index)}
                checked={selectedColumns[index] || false}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      }
      // no visibleColumn data, so just use the column names from the result data.
      return (
        <ListItem key={column} button onClick={() => this.handleToggle(index)}>
          <ListItemText primary={`${column}`} />
          <ListItemSecondaryAction>
            <Checkbox
              color="primary"
              onChange={() => this.handleToggle(index)}
              checked={selectedColumns[index] || false}
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
        onClose={handleClose}
      >
        <DialogTitle id="confirmation-dialog-title">Copy Columns to Clipboard</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select the columns you wish to copy to your clipboard. Only one column can be selected
            if copying as a list.
          </DialogContentText>
          <List>{options}</List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={this.handleCSV}
            disabled={selectedColumns.filter(item => item).length < 1}
            color="primary"
            variant="outlined"
          >
            Copy As CSV
          </Button>
          <Button
            onClick={this.handleList}
            disabled={selectedColumns.filter(item => item).length !== 1}
            color="primary"
            variant="outlined"
          >
            Copy As List
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

CopyToClipboardModal.propTypes = {
  open: PropTypes.bool.isRequired,
  visibleColumns: PropTypes.object,
  resultData: PropTypes.object,
  callback: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired
};

CopyToClipboardModal.defaultProps = {
  visibleColumns: null,
  resultData: null
};

export default CopyToClipboardModal;
