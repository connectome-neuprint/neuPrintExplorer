import React from 'react';
import PropTypes from 'prop-types';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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
