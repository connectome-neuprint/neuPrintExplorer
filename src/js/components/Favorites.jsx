/*
 * Favorites & Saved searches.
 * This page show the favorite search queries that have been stored in
 * addition to saved search results.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { format } from 'date-fns';

import Typography from '@mui/material/Typography';
import { withStyles } from '@material-ui/core/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';

import { TablePaginationActions } from 'plugins/support';
import { apiError } from 'actions/app';
import { setSearchQueryString, getQueryString } from 'helpers/queryString';

import DeleteButton from './Favorites/DeleteButton';

const styles = theme => ({
  root: {
    overflow: 'auto',
    padding: theme.spacing(3)
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
      rowsPerPage: 10,
      favoritesLoaded: false,
      favoritesLoading: false,
      favoritesArr: [],
      searchesLoaded: false,
      searchesLoading: false,
      searchesArr: []
    };
  }

  componentDidMount() {
    this.fetchBookmarks();
    this.fetchSavedSearches();
  }

  componentDidUpdate() {
    this.fetchBookmarks();
    this.fetchSavedSearches();
  }

  fetchSavedSearches = () => {
    const { searchesLoaded, searchesLoading } = this.state;
    if (!searchesLoaded && !searchesLoading) {
      const { token, appDB, actions } = this.props;
      if (token !== '') {
        this.setState({ searchesLoading: true });
        // fetch favorites and add to state
        fetch(`${appDB}/user/searches`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          method: 'GET'
        })
          .then(result => result.json())
          .then(items => {
            const itemList = !(items instanceof Array) ? [items] : items;

            this.setState({ searchesArr: itemList, searchesLoaded: true, searchesLoading: false });
          })
          .catch(error => {
            actions.apiError(error);
          });
      }
    }
  };

  fetchBookmarks = () => {
    const { favoritesLoaded, favoritesLoading } = this.state;
    if (!favoritesLoaded && !favoritesLoading) {
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

            this.setState({
              favoritesArr: itemList,
              favoritesLoaded: true,
              favoritesLoading: false
            });
          })
          .catch(error => {
            actions.apiError(error);
          });
      }
    }
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value });
  };

  handleDelete = id => {
    // grab the favorites array
    const { favoritesArr } = this.state;
    // filter it to remove the one with the passed id.
    const purged = favoritesArr.filter(item => item.id !== id);
    // set the array back in the state.
    this.setState({ favoritesArr: purged });
  };

  handleDeleteSearch = id => {
    // grab the searches array
    const { searchesArr } = this.state;
    // filter it to remove the one with the passed id.
    const purged = searchesArr.filter(item => item.id !== id);
    // set the array back in the state.
    this.setState({ searchesArr: purged });
  };

  handleViewSearch = id => {
    const { history } = this.props;
    // updates the url to include the 'sv' (saved search plugin)
    // and the id to load, then redirect to the results page

    // add a new tab with query type 'sv'
    // and the cloud id to be loaded
    setSearchQueryString({
      code: 'sv',
      pm: {
        id
      }
    });
    // change the page location to /results
    history.push({
      pathname: '/results',
      search: getQueryString()
    });
  };

  render() {
    const { classes, token } = this.props;
    const { rowsPerPage, page, favoritesArr, searchesArr } = this.state;
    const startRecord = page * rowsPerPage;

    const searchRows = searchesArr.slice(startRecord, page * rowsPerPage + rowsPerPage).map(row => {
      const rowKey = row.id;
      return (
        <TableRow key={rowKey}>
          <TableCell>
            <Typography>
              <Button color="primary" onClick={() => this.handleViewSearch(row.id)}>
                {row.value.name} - {format(new Date(row.value.timestamp), 'MM/dd/yyyy H:mm')}
              </Button>
            </Typography>
          </TableCell>
          <TableCell>
            <Typography>{row.value.cypher}</Typography>
          </TableCell>
          <TableCell>
            <DeleteButton
              {...this.props}
              type="searches"
              id={row.id}
              removeItem={this.handleDeleteSearch}
            />
          </TableCell>
        </TableRow>
      );
    });

    const favoriteRows = favoritesArr
      .slice(startRecord, page * rowsPerPage + rowsPerPage)
      // remove any items that don't have the value property, these were set using the old system.
      .filter(item => item.value)
      .map(tableinfo => {
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
                  colSpan={3}
                  count={favoritesArr.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={this.handleChangePage}
                  onRowsPerPageChange={this.handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <div />
        )}
        <Typography variant="h6">Saved Searches</Typography>
        {token !== '' ? (
          <Table className={classes.table}>
            <TableBody>{searchRows}</TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  colSpan={3}
                  count={searchesArr.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={this.handleChangePage}
                  onRowsPerPageChange={this.handleChangeRowsPerPage}
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
    apiError: error => {
      dispatch(apiError(error));
    }
  }
});

Favorites.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
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
