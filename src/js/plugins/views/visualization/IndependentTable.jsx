// Table that handles its own state
import React from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableSortLabel from '@mui/material/TableSortLabel';
import { withStyles } from '@material-ui/core/styles';

import { TablePaginationActions } from 'plugins/support';

import { stableSort, getSorting } from '../shared/vishelpers';

const styles = theme => ({
  root: {
    width: '100%'
  },
  clickable: {
    cursor: 'pointer'
  },
  scroll: {
    marginTop: theme.spacing(1),
    overflowY: 'auto',
    overflowX: 'auto'
  }
});

const handleCellClick = action => () => {
  action();
};


class IndependentTable extends React.Component {
  constructor(props) {
    super(props);
    const { paginate, page, orderBy, order, rowsPerPage } = this.props;
    this.state = {
      paginate,
      page,
      orderBy,
      order,
      rowsPerPage
    };
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleRequestSort = property => () => {
    const { orderBy, order } = this.state;

    const newOrderBy = property;
    const newOrder = orderBy === property && order === 'desc' ? 'asc' : 'desc';

    this.setState({ order: newOrder, orderBy: newOrderBy });
  };

  render() {
    const { data, columns, disableSort, classes, highlightIndex } = this.props;
    let { rowsPerPage } = this.state;
    const { paginate, orderBy, order, page } = this.state;

    // fit table to data
    if (data.length < rowsPerPage || paginate === false) {
      rowsPerPage = data.length;
    }
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((header, index) => {
                  const headerKey = `${header}${index}`;
                  if (disableSort.size > 0 && disableSort.has(index)) {
                    return <TableCell key={headerKey}>{header}</TableCell>;
                  }
                  return (
                    <TableCell key={headerKey} sortDirection={orderBy === index ? order : false}>
                      <TableSortLabel
                        active={orderBy === index}
                        direction={order}
                        onClick={this.handleRequestSort(index)}
                      >
                        {header}
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  let rowStyle = {};
                  const currspot = page * rowsPerPage + index;
                  if (highlightIndex && currspot.toString() in highlightIndex) {
                    rowStyle = { backgroundColor: highlightIndex[currspot.toString()] };
                  }
                  const key = index;
                  return (
                    <TableRow hover key={key} style={rowStyle}>
                      {row.map((cell, i) => {
                        if (cell && typeof cell === 'object' && 'value' in cell) {
                          const cellKey = `${i}${cell.value}`;
                          if ('action' in cell) {
                            return (
                              <TableCell
                                className={classes.clickable}
                                key={cellKey}
                                onClick={handleCellClick(cell.action)}
                              >
                                {cell.value}
                              </TableCell>
                            );
                          }
                          return <TableCell key={cellKey}>{cell.value}</TableCell>;
                        }
                        const cellKey = `${i}${cell}`;
                        return <TableCell key={cellKey}>{cell}</TableCell>;
                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell key="empty" colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {paginate ? (
          <TablePagination
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={this.handleChangePage}
            onRowsPerPageChange={this.handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            ActionsComponent={TablePaginationActions}
          />
        ) : null}
      </div>
    );
  }
}

IndependentTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  columns: PropTypes.arrayOf(PropTypes.any).isRequired,
  paginate: PropTypes.bool,
  page: PropTypes.number,
  orderBy: PropTypes.string,
  order: PropTypes.string,
  rowsPerPage: PropTypes.number,
  classes: PropTypes.object.isRequired,
  disableSort: PropTypes.object,
  highlightIndex: PropTypes.object
};

IndependentTable.defaultProps = {
  paginate: true,
  page: 0,
  orderBy: '',
  order: 'asc',
  rowsPerPage: 5,
  disableSort: new Set([]),
  highlightIndex: {}
};

export default withStyles(styles)(IndependentTable);
