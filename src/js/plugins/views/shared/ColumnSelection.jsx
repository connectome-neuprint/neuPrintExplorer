import React from 'react';
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import ConfirmationDialog from './ConfirmationDialog';

class ColumnSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuVisible: false
    };
  }

  handleMenuToggle = () => {
    const { menuVisible } = this.state;
    this.setState({ menuVisible: !menuVisible });
  };

  handleClose = () => {
    this.setState({ menuVisible: false });
  };

  render() {
    const { columns, onChange } = this.props;

    // if we don't have any columns to chose from, then don't show the menu.
    if (columns.size === 0) {
      return null;
    }

    const { menuVisible } = this.state;
    const columnTotal = columns.filter(column => !column.hidden).size;
    const columnsVisible = columns.filter(column => !column.hidden).filter(column => column.status)
      .size;
    const labelText = `Columns Visible ${columnsVisible} / ${columnTotal}`;

    return (
      <>
        <Chip
          style={{ margin: '0.5em 0.5em', float: 'left' }}
          label={labelText}
          onClick={this.handleMenuToggle}
        />
        <ConfirmationDialog
          open={menuVisible}
          columns={columns}
          onChange={onChange}
          onConfirm={this.handleClose}
        />
      </>
    );
  }
}

ColumnSelection.propTypes = {
  columns: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ColumnSelection;
