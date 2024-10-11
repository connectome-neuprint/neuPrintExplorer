import React, { useState } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';

import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  icon: {
    marginLeft: '3px',
    marginTop: '3px',
    cursor: 'pointer',
    color: theme.palette.primary.main
  },
});


// https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
function hexToRgbA(hex, opacity = 1) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = `0x${c.join('')}`;
    /* eslint-disable no-bitwise */
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(', ')}, ${opacity})`;
  }
  throw new Error('Bad Hex');
}



function MotifTable({ motif, headers }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>{" "}
          {motif.motifId}{" "}
					<Tooltip title="Skeleton View">
						<IconButton aria-label="show skeleton view" size="small"
							onClick={motif.skeletonViewLink}
							fontSize="inherit"
						>
							<Icon>visibility</Icon>
						</IconButton>
					</Tooltip>
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableCell key={header}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {motif.nodes.map((node) => (
                    <TableRow
                      key={node.cells[0]}
                      style={{ backgroundColor: hexToRgbA(node.color, 0.4) }}
                    >
                      {node.cells.map((cell) => {
                        if (cell && typeof cell === 'object' && 'value' in cell) {
                          return <TableCell key={cell}>{cell.value}</TableCell>;
                        }
                        return <TableCell key={cell} >{cell}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

MotifTable.propTypes = {
  motif: PropTypes.object.isRequired,
  headers: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default withStyles(styles)(MotifTable);

