import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MotifTable from './Motif/MotifTable';

const styles = (theme) => ({
  root: {
    width: '100%',
  },
  clickable: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
    cursor: 'pointer',
  },
  scroll: {
    marginTop: theme.spacing(1),
    overflowY: 'auto',
    overflowX: 'auto',
  },
  icon: {
    marginLeft: '3px',
    marginTop: '3px',
    cursor: 'pointer',
    color: theme.palette.primary.main,
  },
});

function MotifView({ classes, query }) {
  const rows = query.result.data.map((motif) => (
    <MotifTable key={motif.motifId} motif={motif} headers={query.result.columns} />
  ));

  return (
    <div className={classes.root}>
      <div className={classes.scroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Motif</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </div>
    </div>
  );
}

MotifView.propTypes = {
  classes: PropTypes.object.isRequired,
  query: PropTypes.object.isRequired,
};

export default withStyles(styles)(MotifView);
