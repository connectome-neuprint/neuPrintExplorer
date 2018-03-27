/*
 * Main page to hold results from query.  This could be
 * a simple table or a table of tables.
*/

"use strict";

import React from 'react';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TablePagination,
  TableRow,
} from 'material-ui/Table';
import { connect } from 'react-redux';
import _ from "underscore";
import TablePaginationActions from './TablePaginationActions.react';


const styles = () => ({
  root: {
    width: '80%',
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

    componentWillReceiveProps(nextProps) {
        nextProps.location["search"] = this.props.location["search"];
        if (!_.isEqual(nextProps, this.props)) {
            this.fetchBookmarks(nextProps);        
        }
    }

    // if only query string has updated, prevent re-render
    shouldComponentUpdate(nextProps, nextState) {
        nextProps.location["search"] = this.props.location["search"];
        return ((!_.isEqual(nextProps, this.props)) || (!_.isEqual(nextState, this.state)));
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
            <div className={classes.root}>
                <Typography variant="title">Favorites</Typography>
                {this.props.userInfo !== null ? 
                (<Table className={classes.table}>
                    <TableBody>
                    {this.state.favoritesArr.slice(startRecord, page * rowsPerPage + rowsPerPage).map( (tableinfo, index) => {
                        return (
                            <TableRow key={startRecord + index}>
                                <TableCell><Typography variant="body2"><a href={tableinfo.url}>{tableinfo.name}</a></Typography></TableCell>
                                <TableCell><Typography variant="body1">{tableinfo.cypher}</Typography></TableCell>
                            </TableRow>
                        );
                    })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TablePagination
                          colSpan={2}
                          count={this.state.favoritesArr.length}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onChangePage={this.handleChangePage}
                          onChangeRowsPerPage={this.handleChangeRowsPerPage}
                          Actions={TablePaginationActions}
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

Favorites.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }),
    userInfo: PropTypes.object,
};




export default withStyles(styles)(connect(FavoritesState, null)(Favorites));


