/*
 * Shows results for table.  Parent component might allow
 * for multiple tables and will contain a label name for
 * the table.  This code was adapted from a material-ui example.
*/

"use strict"

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, {
  TableBody,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import TablePaginationActions from './TablePaginationActions.react';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 1,
    overflowX: 'auto',
  },
  fcell: {
    height: "1px",
  },
  table: {
    minWidth: 500,
  },
  cellpad: {
    padding: 0,
  }
});

class SimpleTable extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      page: 0,
      rowsPerPage: 10,
    };
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    const startRecord = page * rowsPerPage;

    var numcols = 0;
    if (this.props.data.body.length > 0) {
        numcols = this.props.data.body[0].length;
    }

    return (
      <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
                <TableRow>
                {this.props.data.header.map((header) => {
                    return (
                        header.getComponent()
                    );
                })}
                </TableRow>
            </TableHead>
            <TableBody>
                {(
                    this.props.data.body.slice(startRecord, page * rowsPerPage + rowsPerPage).map( (rec, index)  => {
                    var cells = rec.map( (entry) => {
                        return (
                            entry.getComponent()
                        )
                    });
                    return (
                        <TableRow key={startRecord + index}>
                            {cells}
                        </TableRow>
                    );
                  })
                )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={numcols}
                  count={this.props.data.body.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  Actions={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
      </Paper>
    );
  }
}

SimpleTable.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.shape({
        body: PropTypes.array,
        header: PropTypes.array,
    })
};

export default withStyles(styles)(SimpleTable);
