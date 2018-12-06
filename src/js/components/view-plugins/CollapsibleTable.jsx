import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import TablePaginationActions from 'helpers/TablePaginationActions';
import SimpleTable from 'views/SimpleTable';

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
    marginTop: theme.spacing.unit * 1,
    overflowY: 'auto',
    overflowX: 'auto',
    height: '100%'
  }
});

class CollapsibleTable extends React.Component {
  constructor(props) {
    super(props);
    const { properties } = this.props;
    const { rowsPerPage } = properties;

    this.state = {
      page: 0,
      rowsPerPage
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

  render() {
    const { query, classes } = this.props;
    const { page, rowsPerPage } = this.state;
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, query.result.data.length - page * rowsPerPage);

    let paginate = true;
    if ('paginate' in query.result && query.result.paginate === 0) {
      paginate = false;
    }

    const { highlightIndex } = query.result;

    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
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
                        <ExpansionPanel>
                          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>{row.name}</Typography>
                          </ExpansionPanelSummary>
                          <ExpansionPanelDetails className={classes.nopad}>
                            <SimpleTable query={{result: row}} />
                          </ExpansionPanelDetails>
                        </ExpansionPanel>
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

CollapsibleTable.propTypes = {
  query: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  properties: PropTypes.object
};

CollapsibleTable.defaultProps = {
  properties: {
    rowsPerPage: 5
  }
};

export default withStyles(styles)(CollapsibleTable);
