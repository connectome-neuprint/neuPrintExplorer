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
    overflowY: "auto",
    overflowX: "auto",
    height: '100%',
  },
  fcell: {
    height: "1px",
  },
  table: {
    minWidth: 500,
  },
  cellpad: {
    padding: 0,
  },
  paper: {
    width: '100%',
    overflowX: "auto",
  }
});

class SimpleTable extends React.Component {
  constructor(props, context) {
    super(props, context);

    let rows = 10;
    if (("paginate" in this.props.data) && (!this.props.data.paginate)) {
        rows = this.props.data.body.length;
    }

    this.state = {
      page: 0,
      rowsPerPage: rows,
      translateY: "translate(0,0)",
    };
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  scrollEvent = () => {
      let el = this.refs.scrolldiv;
      let translateY = "translate(0,"+el.scrollTop+"px)";
      let translateX = "translate("+el.scrollLeft+"px,0)";
      this.setState({translateY: translateY, translateX: translateX});
  
      let all = document.getElementsByClassName('lockLeft-' + this.props.data.uniqueId);
        for (var i = 0; i < all.length; i++) {
            all[i].style.transform = translateX;
        }
  }

  render() {
    const { classes } = this.props;
    const { rowsPerPage, page } = this.state;
    const startRecord = page * rowsPerPage;

    var numcols = 0;
    if (this.props.data.body.length > 0) {
        numcols = this.props.data.body[0].length;
    }

    let paginate = true;
    if (("paginate" in this.props.data) && (!this.props.data.paginate)) {
        paginate = false;
    }
  
    return (
        <div 
                className={classes.root}
                ref="scrolldiv"
                onScroll={this.scrollEvent}
        >
          <Table className={classes.table}>
            <TableHead style={{transform: this.state.translateY}}>
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
                        <TableRow 
                                    hover
                                    key={startRecord + index}
                        >
                            {cells}
                        </TableRow>
                    );
                  })
                )}
            </TableBody>
            {   
                (paginate) ? 
                (
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
                ) :
                 (null)
            }
          </Table>
      </div>
    );
  }
}

SimpleTable.propTypes = {
    classes: PropTypes.object.isRequired,
    data: PropTypes.shape({
        body: PropTypes.array,
        header: PropTypes.array,
        paginate: PropTypes.bool,
    })
};

export default withStyles(styles)(SimpleTable);
