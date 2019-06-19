/*
 * Favorites & Saved searches.
 * This page show the favorite search queries that have been stored in
 * addition to saved search results.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import TablePaginationActions from '@neuprint/support';
import { apiError } from 'actions/app';

import DeleteButton from './Favorites/DeleteButton';

const styles = theme => ({
  root: {
    overflow: 'auto',
    padding: theme.spacing.unit * 3
  },
  table: {
    minWidth: 500
  },
  tableWrapper: {
    overflowX: 'auto'
  }
});

class Favorites extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      page: 0,
      rowsPerPage: 5,
      favoritesLoaded: false,
      favoritesLoading: false,
      favoritesArr: []
    };
  }

  componentDidMount() {
    const { favoritesLoaded, favoritesLoading } = this.state;
    if (!favoritesLoaded && !favoritesLoading) {
      this.fetchBookmarks();
    }
  }

  componentDidUpdate() {
    const { favoritesLoaded, favoritesLoading } = this.state;
    if (!favoritesLoaded && !favoritesLoading) {
      this.fetchBookmarks();
    }
  }

  fetchBookmarks = () => {
    const { token, appDB, actions } = this.props;
    if (token !== '') {
       this.setState({ favoritesLoading: true });
      // fetch favorites and add to state
      fetch(`${appDB}/user/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: 'GET'
      })
        .then(result => result.json())
        .then(items => {
          const itemList = !(items instanceof Array) ? [items] : items;

          this.setState({ favoritesArr: itemList, favoritesLoaded: true, favoritesLoading: false });
        })
        .catch(error => {
          actions.apiError(error);
        });
    }
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleDelete = (id) => {
    // grab the favorites array
    const { favoritesArr } = this.state;
    // filter it to remove the one with the passed id.
    const purged = favoritesArr.filter(item => item.id !== id);
    // set the array back in the state.
    this.setState({favoritesArr: purged});
  };

  render() {
    const { classes, token } = this.props;
    const { rowsPerPage, page, favoritesArr } = this.state;
    const startRecord = page * rowsPerPage;

    const favoriteRows = favoritesArr
      .slice(startRecord, page * rowsPerPage + rowsPerPage)
      // remove any items that don't have the value property, these were set using the old system.
      .filter(item => item.value)
      .map((tableinfo) => {
        const rowKey = tableinfo.id;
        return (
          <TableRow key={rowKey}>
            <TableCell>
              <Typography>
                <a href={tableinfo.value.url}>{tableinfo.value.name}</a>
              </Typography>
            </TableCell>
            <TableCell>
              <Typography>{tableinfo.value.cypher}</Typography>
            </TableCell>
            <TableCell>
              <DeleteButton {...this.props} id={tableinfo.id} removeItem={this.handleDelete} />
            </TableCell>
          </TableRow>
        );
      });

    return (
      <div className={classes.root}>
        <Typography variant="h6">Favorites</Typography>
        {token !== '' ? (
          <Table className={classes.table}>
            <TableBody>{favoriteRows}</TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={2}
                  count={favoritesArr.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={this.handleChangePage}
                  onChangeRowsPerPage={this.handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

const FavoritesState = state => ({
  token: state.user.get('token'),
  appDB: state.app.get('appDB')
});

const FavoritesDispatch = dispatch => ({
  actions: {
    apiError: (error) => {
      dispatch(apiError(error));
    }
  }
});

Favorites.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired
  }).isRequired,
  token: PropTypes.string.isRequired,
  appDB: PropTypes.string.isRequired
};

export default withStyles(styles)(
  connect(
    FavoritesState,
    FavoritesDispatch
  )(Favorites)
);
