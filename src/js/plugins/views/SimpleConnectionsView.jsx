import React from 'react';
import PropTypes from 'prop-types';
import clone from 'clone';

import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import withStyles from '@mui/styles/withStyles';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// eslint-disable-next-line import/no-unresolved
import { TablePaginationActions } from 'plugins/support';
import SimpleConnectionsTable from './visualization/SimpleConnectionsTable';
import ColumnSelection from './shared/ColumnSelection';
import CollapseButton from './SimpleConnections/CollapseButton';

const styles = theme => ({
  root: {},
  clickable: {
    cursor: 'pointer'
  },
  nopad: {
    padding: 0
  },
  cellborder: {
    borderBottom: 0
  },
  scroll: {
    width: '100%',
    marginTop: theme.spacing(1),
    overflowY: 'auto',
    overflowX: 'auto',
    height: '100%'
  },
  expandButton: {
    left: '5px',
    right: 'auto',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%) rotate(0deg)',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
  },
  expansionText: {
    margin: '0 0 0 20px'
  }
});

class SimpleConnectionsView extends React.Component {
  handleChangePage = (event, page) => {
    const { query, actions, index } = this.props;
    const { visProps } = query;
    const newVisProps = {...visProps, page };
    const queryCopy = clone(query);
    delete queryCopy.result;
    actions.updateQuery(index, {...queryCopy, visProps: newVisProps });
  };

  handleChangeRowsPerPage = event => {
    const { query, actions, index } = this.props;
    const { visProps } = query;
    const newVisProps = {...visProps, rowsPerPage: event.target.value };
    const queryCopy = clone(query);
    delete queryCopy.result;
    actions.updateQuery(index, {...queryCopy, visProps: newVisProps });
  };

  handleColumnChange = columnIndex => {
    const { actions, index, visibleColumns } = this.props;
    actions.setColumnStatus(index, columnIndex, !visibleColumns.getIn([columnIndex, 'status']));
  };

  handleCollapse = collapsed => {
    const { query, actions, index } = this.props;
    const { visProps } = query;
    const newVisProps = {...visProps,  collapsed };
    // clone to a depth of 2. Anything less than that can result in an
    // Uncaught TypeError: Illegal invocation
    // It looks like the clone code works fine in development, but when
    // transpiled for production it throws the above error, because it
    // can't clone an HTMLElement.
    const queryCopy = clone(query, undefined, 2);
    delete queryCopy.result;
    actions.updateQuery(index, {...queryCopy, visProps: newVisProps });
  };

  renderSingle() {
    const { query, classes, visibleColumns } = this.props;
    const row = query.result.data[0];
    const { visProps = {} } = query;
    const { collapsed = false } = visProps;
    return (
      <div className={classes.root}>
        <Typography className={classes.expansionText}>{row.name}</Typography>
        <ColumnSelection
          columns={visibleColumns}
          onChange={columnIndex => this.handleColumnChange(columnIndex)}
          dataSet={query.pm.dataset}
        />
        <CollapseButton checked={collapsed} callback={this.handleCollapse} />
        <div className={classes.scroll}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className={classes.cellborder} padding="none">
                  <SimpleConnectionsTable
                    visibleColumns={visibleColumns}
                    data={row.data}
                    columns={row.columns}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );

  }

  render() {
    const { query, classes, visibleColumns } = this.props;
    const { visProps = {} } = query;
    let { rowsPerPage = 5 } = visProps;
    const { paginate = true, page = 0, paginateExpansion = false, collapsed = false } = visProps;

    // if there is only one result, then we don't need pagination or the expansion panels.
    if (query.result.data.length === 1) {
      return this.renderSingle();
    }

    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, query.result.data.length - page * rowsPerPage);

    // fit table to data
    if (query.result.data.length < rowsPerPage || paginate === false) {
      rowsPerPage = query.result.data.length;
    }

    const { highlightIndex } = query.result;

    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
        <ColumnSelection
          columns={visibleColumns}
          onChange={columnIndex => this.handleColumnChange(columnIndex)}
          dataSet={query.pm.dataset}
        />
        <CollapseButton checked={collapsed} callback={this.handleCollapse} />
          <Table>
            <TableBody>
              {query.result.data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  let rowStyle = {};
                  const currspot = page * rowsPerPage + index;
                  const rowIndex = `${row.name}${index}`;
                  if (highlightIndex && currspot.toString() in highlightIndex) {
                    rowStyle = { backgroundColor: highlightIndex[currspot.toString()] };
                  }
                  return (
                    <TableRow hover key={rowIndex} style={rowStyle}>
                      <TableCell className={classes.cellborder} padding="none">
                        <Accordion>
                          <AccordionSummary
                            classes={{
                              expandIcon: classes.expandButton
                            }}
                            expandIcon={<ExpandMoreIcon />}
                          >
                            <Typography className={classes.expansionText}>{row.name}</Typography>
                          </AccordionSummary>
                          <AccordionDetails className={classes.nopad}>
                            <SimpleConnectionsTable
                              visibleColumns={visibleColumns}
                              data={row.data}
                              columns={row.columns}
                              paginate={paginateExpansion.valueOf()}
                            />
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
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
            onPageChange={this.handleChangePage}
            onRowsPerPageChange={this.handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            slots={{
              actions: TablePaginationActions
            }}
          />
        ) : null}
      </div>
    );
  }

}

SimpleConnectionsView.propTypes = {
  query: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  visibleColumns: PropTypes.object.isRequired
};

export default withStyles(styles)(SimpleConnectionsView);
