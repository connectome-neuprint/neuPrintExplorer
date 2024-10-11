import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

export default function NodeTable({ rows, columns }) {
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);

  const columnHeaders = columns.map((column) => <TableCell key={column}>{column}</TableCell>);

  const formattedRows = rows
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((row) => {
      const cells = row.map((cell) => <TableCell key={cell}>{cell}</TableCell>);
      return <TableRow key={`${row[0]}_${row[1]}`}>{cells}</TableRow>;
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <TablePagination
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
      />

      <Table>
        <TableHead>
          <TableRow>{columnHeaders}</TableRow>
        </TableHead>
        <TableBody>{formattedRows}</TableBody>
      </Table>
    </>
  );
}

NodeTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))
  ).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
};
