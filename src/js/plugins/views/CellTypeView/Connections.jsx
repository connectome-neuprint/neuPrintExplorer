import React from 'react';
import PropTypes from 'prop-types';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Icon from '@mui/material/Icon';

export default function Connections(props) {
  const { title, id, result } = props;

  if (result[id] && result[id].data) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{title}</TableCell>
            <TableCell align="right">Neuron Weight</TableCell>
            <TableCell align="right">Group Weight</TableCell>
            <TableCell align="right">Good Match</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result[id].data.map((row, i) => {
            const [cellType, neuronWeight, groupWeight, goodMatch] = row;
            const key = `${id}${row}${i}`;
            return (
              <TableRow key={key}>
                <TableCell component="th" scope="row">
                  {cellType}
                </TableCell>
                <TableCell align="right">{neuronWeight}</TableCell>
                <TableCell align="right">{groupWeight}</TableCell>
                <TableCell align="right">
                  {goodMatch && <Icon fontSize="inherit">done</Icon>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
  return null;
}

Connections.propTypes = {
  id: PropTypes.string.isRequired,
  result: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired
};
