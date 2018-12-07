import React from 'react';
import PropTypes from 'prop-types';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { withStyles } from '@material-ui/core/styles';

import TablePaginationActions from 'helpers/TablePaginationActions';

function desc(a, b, orderBy) {
  let aVal = a[orderBy];
  let bVal = b[orderBy];

  // need to check if the cell has a value / action object
  if (aVal && typeof aVal === 'object') {
    if ('sortBy' in aVal) {
      aVal = aVal.sortBy;
    } else if ('value' in aVal) {
      aVal = aVal.value;
    }
  }

  if (bVal && typeof bVal === 'object') {
    if ('sortBy' in bVal) {
      bVal = bVal.sortBy;
    } else if ('value' in bVal) {
      bVal = bVal.value;
    }
  }

  // need to check for null values
  if (bVal === null) {
    return 1;
  }
  if (aVal === null) {
    return -1;
  }

  // now finish the sort
  if (bVal < aVal) {
    return -1;
  }
  if (bVal > aVal) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const styles = theme => ({
  root: {
    width: '100%'
  },
  clickable: {
    cursor: 'pointer'
  },
  scroll: {
    marginTop: theme.spacing.unit * 1,
    overflowY: 'auto',
    overflowX: 'auto'
  }
});

class SimpleTable extends React.Component {
  constructor(props) {
    super(props);
    const { properties } = this.props;
    // default values
    let { paginate, rowsPerPage } = properties;

    // set defaults if not specified by user
    if (!rowsPerPage) {
      rowsPerPage = 5;
    }

    if (!paginate) {
      paginate = true;
    }

    this.state = {
      order: 'asc',
      orderBy: '',
      page: 0,
      rowsPerPage,
      paginate
    };
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleCellClick = action => () => {
    action();
  };

  handleRequestSort = property => () => {
    const { orderBy, order } = this.state;
    const newOrderBy = property;
    let newOrder = 'desc';

    if (orderBy === property && order === 'desc') {
      newOrder = 'asc';
    }

    this.setState({ order: newOrder, orderBy: newOrderBy });
  };

  render() {
    const { query, classes } = this.props;
    const { page, orderBy, order } = this.state;
    let { rowsPerPage } = this.state;
    let { paginate } = this.state;
    // fit table to data
    if (query.result.data.length < rowsPerPage) {
      rowsPerPage = query.result.data.length;
    }
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, query.result.data.length - page * rowsPerPage);

    // TODO: use visProps when roi connectivity plugin has been refactored.
    if ('paginate' in query.result && query.result.paginate === 0) {
      paginate = false;
    }

    const { highlightIndex } = query.result;

    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
          <Table>
            <TableHead>
              <TableRow>
                {query.result.columns.map((header, index) => {
                  const headerKey = `${header}${index}`;
                  if ('disableSort' in query.result && query.result.disableSort.has(index)) {
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
              {stableSort(query.result.data, getSorting(order, orderBy))
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
                                onClick={this.handleCellClick(cell.action)}
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
            count={query.result.data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={this.handleChangePage}
            onChangeRowsPerPage={this.handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            ActionsComponent={TablePaginationActions}
          />
        ) : null}
      </div>
    );
  }
}

SimpleTable.propTypes = {
  query: PropTypes.object.isRequired,
  properties: PropTypes.object,
  classes: PropTypes.object.isRequired
};

SimpleTable.defaultProps = {
  properties: {}
};

export default withStyles(styles)(SimpleTable);
