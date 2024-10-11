import React from 'react';
import PropTypes from 'prop-types';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Icon from '@material-ui/core/Icon';

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
