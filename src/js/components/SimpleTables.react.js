/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';
import SimpleTable from './SimpleTable.react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
} from 'material-ui/Table';
import TablePaginationActions from './TablePaginationActions.react';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 1,
  },
  table: {
    minWidth: 500,
  },
  cellborder: {
    borderBottom: 0,
  },
  nopad: {
    padding: 0,
  }
});

class SimpleTables extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            page: 0,
            rowsPerPage: 5,
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
        
        return (
            <div className={classes.root}>
            {this.props.allTables !== null ?
                ((this.props.allTables.length != 1) ?
                    (<Table className={classes.table}>
                        <TableBody>
                        {this.props.allTables.slice(startRecord, page * rowsPerPage + rowsPerPage).map( (tableinfo, index) => {
                            return (
                                <TableRow key={startRecord + index}>
                                    <TableCell 
                                                className={classes.cellborder} 
                                                padding="none"
                                    >
                                        <ExpansionPanel>
                                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography>
                                                    {tableinfo.name}
                                                </Typography> 
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails className={classes.nopad}>
                                                <SimpleTable data={tableinfo} />
                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TablePagination
                              colSpan={1}
                              count={this.props.allTables.length}
                              rowsPerPage={rowsPerPage}
                              page={page}
                              onChangePage={this.handleChangePage}
                              onChangeRowsPerPage={this.handleChangeRowsPerPage}
                              Actions={TablePaginationActions}
                            />
                          </TableRow>
                        </TableFooter>
                    </Table>) :
                    (
                        <SimpleTable data={this.props.allTables[0]} />
                    )
                ) :
                <div />
            }
            </div>
        );
    }
}

SimpleTables.propTypes = {
    classes: PropTypes.object.isRequired,
    allTables: PropTypes.array
};


export default withStyles(styles)(SimpleTables);


