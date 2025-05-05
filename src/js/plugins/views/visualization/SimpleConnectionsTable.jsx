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
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import withStyles from '@mui/styles/withStyles';

import { TablePaginationActions } from 'plugins/support';

import { stableSort, getSorting, getRoiBarChartForConnection } from '../shared/vishelpers';

const styles = theme => ({
  root: {
    width: '100%'
  },
  clickable: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
    cursor: 'pointer'
  },
  scroll: {
    marginTop: theme.spacing(1),
    overflowY: 'auto',
    overflowX: 'auto'
  },
  expansionRow: {
    backgroundColor: '#f7f7f7'
  }
});

const handleCellClick = action => () => {
  action();
};
class SimpleConnectionsTable extends React.Component {
  constructor(props) {
    super(props);
    const { paginate, page, orderBy, order, rowsPerPage } = this.props;
    this.state = {
      paginate,
      page,
      orderBy,
      order,
      rowsPerPage,
      isExpanded: {},
      expansionPanels: {}
    };
    this.addIconStyle = {
      width: '.75em',
      height: '.75em'
    };
    this.removeIconStyle = {
      width: '.75em',
      height: '.75em'
    };
  }

  handleChangePage = (_, page) => {
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

  toggleExpandPanel = (key, parameters, connectionWeight) => {
    const { isExpanded, expansionPanels } = this.state;
    const { roiList, bodyIdA, bodyIdB } = parameters;
    const newIsExpanded = { ...isExpanded };
    const newAccordions = { ...expansionPanels };
    if (isExpanded[key]) {
      delete newIsExpanded[key];
      delete newAccordions[key];
    } else {
      newIsExpanded[key] = true;
      newAccordions[key] = <div>loading...</div>;
      fetch('/api/custom/custom?np_explorer=simple_connections_roi', {
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(parameters),
        method: 'POST',
        credentials: 'include'
      })
        .then(result => result.json())
        .then(resp => {
          // sends error message provided by neuprinthttp
          if (resp.error) {
            throw new Error(resp.error);
          }
          const csRoiInfo = JSON.parse(resp.data[0][0]) || {};

          newAccordions[key] = getRoiBarChartForConnection(
            csRoiInfo,
            roiList,
            connectionWeight,
            bodyIdA,
            bodyIdB
          );

          this.setState({ expansionPanels: newAccordions });
        })
        .catch(error => {
          newAccordions[key] = `Error: ${error}`;
          this.setState({ expansionPanels: newAccordions });
        });
    }
    this.setState({ isExpanded: newIsExpanded, expansionPanels: newAccordions });
  };

  render() {
    const { data = [], columns = [], disableSort, classes, visibleColumns } = this.props;
    let { rowsPerPage } = this.state;
    const { paginate, orderBy, order, page, isExpanded, expansionPanels } = this.state;

    let numCols = 1; // starts at 1 due to expansion button column

    // fit table to data
    if (data.length < rowsPerPage || paginate === false) {
      rowsPerPage = data.length;
    }
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    const columnCells = columns.map((header, index) => {
      const headerKey = `${header}${index}`;
      numCols += 1;
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
    });

    const filteredColumns =
      visibleColumns.size === 0
        ? columnCells
        : columnCells.filter((column, i) => visibleColumns.getIn([i, 'status']));

   
    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
          <Table padding="dense">
            <TableHead>
              <TableRow>
                <TableCell key="expansionHeader" />
                {filteredColumns}
              </TableRow>
            </TableHead>
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
                  const bodyId = (row[1].sortBy) ? row[1].sortBy.toString() : row[1]; // should be body id
                  const filteredRow =
                    visibleColumns.size === 0
                      ? row
                      : row.filter((column, i) => visibleColumns.getIn([i, 'status']));
                  const keyId = `${bodyId}_${row[2]}_${row[4]}_${row[5]}`;
                  return (
                    <React.Fragment key={keyId}>
                      <TableRow hover key={keyId}>
                        {filteredRow.map((cell, i) => {
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
                          if (i === 0) {
                            return (
                              <TableCell key="expansionButton">
                                <IconButton
                                  aria-label="Expand"
                                  onClick={() => this.toggleExpandPanel(keyId, cell, row[5].sortBy)}
                                  size="large">
                                  {isExpanded[keyId] ? (
                                    <RemoveIcon style={this.removeIconStyle} />
                                  ) : (
                                    <AddIcon style={this.addIconStyle} />
                                  )}
                                </IconButton>
                              </TableCell>
                            );
                          }
                          const cellKey = `${i}${cell}`;
                          return <TableCell key={cellKey}>{cell}</TableCell>;
                        })}
                      </TableRow>
                      {isExpanded[keyId] && (
                        <TableRow key={`${keyId}panel`} className={classes.expansionRow}>
                          <TableCell
                            colSpan={numCols}
                            style={{ paddingLeft: '10px' }}
                            key={`${keyId}panelcell`}
                          >
                            {expansionPanels[keyId]}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell key="empty" colSpan={numCols} />
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

SimpleConnectionsTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string || PropTypes.object).isRequired,
  paginate: PropTypes.bool,
  page: PropTypes.number,
  orderBy: PropTypes.string,
  order: PropTypes.string,
  rowsPerPage: PropTypes.number,
  classes: PropTypes.object.isRequired,
  disableSort: PropTypes.object,
  visibleColumns: PropTypes.object.isRequired
};

SimpleConnectionsTable.defaultProps = {
  paginate: true,
  page: 0,
  orderBy: '',
  order: 'asc',
  rowsPerPage: 25,
  disableSort: new Set([])
};

export default withStyles(styles)(SimpleConnectionsTable);
