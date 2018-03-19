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
  TableHead,
  TablePagination,
  TableRow,
} from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import FirstPageIcon from 'material-ui-icons/FirstPage';
import KeyboardArrowLeft from 'material-ui-icons/KeyboardArrowLeft';
import KeyboardArrowRight from 'material-ui-icons/KeyboardArrowRight';
import LastPageIcon from 'material-ui-icons/LastPage';
import Link from 'react-router-dom';
import { connect } from 'react-redux';

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

class TablePaginationActions extends React.Component {
  handleFirstPageButtonClick = event => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = event => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = event => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = event => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1),
    );
  };

  render() {
    const { classes, count, page, rowsPerPage, theme } = this.props;

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
}

TablePaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, { withTheme: true })(
  TablePaginationActions,
);

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
});

class Favorites extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            page: 0,
            rowsPerPage: 5,
            favoritesArr: []
        };
        this.fetchBookmarks(props);
    }
    
    fetchBookmarks = (props) => {
        if (props.userInfo !== null) {
            // fetch favorites and add to state
            var googleToken = props.userInfo["Zi"]["id_token"];
            fetch('/favoritesdb', {
                headers: {
                'Authorization': googleToken,
                'content-type': 'application/json'
                },
            })
            .then(result=>result.json())
            .then(items=> {
                var temparray = [];
                for (var item in items) {
                    temparray.push({
                        name: items[item].name,
                        url: items[item].url,
                        cypher: items[item].cypher
                    });
                }
                this.setState({favoritesArr: temparray});
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        this.fetchBookmarks(nextProps);        
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    // TODO: add favorites deletion
    render() {
        const { classes } = this.props;
        const { rowsPerPage, page } = this.state;
        const startRecord = page * rowsPerPage;
        
        return (
            <div>
                <Typography variant="title">Favorites</Typography>
                {this.props.userInfo !== null ? 
                (<Table className={classes.table}>
                {this.state.favoritesArr.slice(startRecord, page * rowsPerPage + rowsPerPage).map( (tableinfo, index) => {
                    return (
                        <TableRow key={startRecord + index}>
                            <TableCell><a href={tableinfo.url}>{tableinfo.name}</a></TableCell>
                            <TableCell>{tableinfo.cypher}</TableCell>
                        </TableRow>
                    );
                })}
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          colSpan={2}
                          count={this.state.favoritesArr.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onChangePage={this.handleChangePage}
                          onChangeRowsPerPage={this.handleChangeRowsPerPage}
                          Actions={TablePaginationActionsWrapped}
                        />
                      </TableRow>
                    </TableFooter>
                </Table>) :
                <div />
                }
            </div>
        );
    }
}

var FavoritesState = function(state) {
    return {
        userInfo: state.userInfo
    }
};

export default withStyles(styles)(connect(FavoritesState, null)(Favorites));


