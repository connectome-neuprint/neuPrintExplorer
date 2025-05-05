import React from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function MissingConnections(props) {
  const { title, data, id } = props;

  if (data[id] && data[id].data) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{title}</TableCell>
            <TableCell align="right">Neuron Weight</TableCell>
            <TableCell align="right">Group Weight</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data[id].data.map((row, i) => {
            const [cellType, groupWeight, neuronWeight] = row;
            const key = `${id}${row}${i}`;
            return (
              <TableRow key={key}>
                <TableCell component="th" scope="row">
                  {cellType}
                </TableCell>
                <TableCell align="right">{neuronWeight}</TableCell>
                <TableCell align="right">{groupWeight}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
  return null;
}

MissingConnections.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
}
