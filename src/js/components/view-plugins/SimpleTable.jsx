import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import { withStyles } from '@material-ui/core/styles';

import TablePaginationActions from '../../helpers/TablePaginationActions';

const styles = theme => ({
  root: {},
  scroll: {
    width: '100%',
    marginTop: theme.spacing.unit * 1,
    overflowY: 'auto',
    overflowX: 'auto',
    height: '100%'
  }
});

class SimpleTable extends React.Component {
  state = {
    data: [],
    page: 0,
    rowsPerPage: 5
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { query, classes } = this.props;
    const { page, rowsPerPage } = this.state;
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, query.result.data.length - page * rowsPerPage);

    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
          <Table>
            <TableHead>
              <TableRow>
                {query.result.columns.map((header, index) => {
                  return <TableCell key={index}>{header}</TableCell>;
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {query.result.data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow key={index}>
                      {row.map((cell, i) => {
                        return <TableCell key={i}>{cell}</TableCell>;
                      })}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 48 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          component="div"
          count={query.result.data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
      </div>
    );
  }
}

export default withStyles(styles)(SimpleTable);
