import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';

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
