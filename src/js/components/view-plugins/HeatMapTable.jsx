import React from 'react';
import ColorBox from '../visualization/ColorBox.react';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {},
  clickable: {
    cursor: 'pointer'
  },
  scroll: {
    width: '100%',
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 1,
    overflowY: 'auto',
    overflowX: 'auto',
    maxHeight: '90vh'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    margin: '0px'
  },
  labelBlank: {
    margin: '0px',
    padding: '0px',
    position: '-webkit-sticky',
    position: 'sticky',
    zIndex: 1,
    top: '0px',
    left: '0px'
  },
  labelTop: {
    margin: '0px',
    padding: '0px',
    position: '-webkit-sticky',
    position: 'sticky',
    top: '0px'
  },
  labelSide: {
    margin: '0px',
    padding: '0px',
    position: '-webkit-sticky',
    position: 'sticky',
    left: '0px'
  },
  data: {
    margin: '0px',
    padding: '0px'
  },
  table: {
    borderSpacing: '0px',
    border: '0px',
    borderCollapse: 'collapse'
  }
});

class HeatMapTable extends React.Component {
  render() {
    const { query, classes } = this.props;
    const { squareSize } = query.visProps;

    return (
      <div className={classes.root}>
        <div className={classes.scroll}>
          <table className={classes.table}>
            <tbody>
              <tr>
                {query.result.columns.map(column => {
                  // empty cells have background that matches app and stay fixed on top when scrolling
                  const backgroundColor = column.length > 0 ? 'white' : '#f9f9f9';
                  const styleClass = column.length > 0 ? classes.labelTop : classes.labelBlank;
                  return (
                    <th className={styleClass} key={'tablecolumnlabel' + column}>
                      <ColorBox
                        margin={0}
                        width={squareSize}
                        height={squareSize}
                        backgroundColor={backgroundColor}
                        title={''}
                        text={
                          <div>
                            <Typography>{column}</Typography>
                          </div>
                        }
                        key={'header' + column}
                      />
                    </th>
                  );
                })}
              </tr>
              {query.result.data.map((row, index) => {
                const rowKey = query.result.columns[index + 1];
                return (
                  <tr key={'tablerow' + rowKey}>
                    {row.map((element, index) => {
                      // row name column
                      if (index === 0) {
                        return (
                          <th className={classes.labelSide} key={'tablerowlabel' + element}>
                            <ColorBox
                              margin={0}
                              width={squareSize}
                              height={squareSize}
                              backgroundColor={'white'}
                              title={''}
                              text={<Typography>{element}</Typography>}
                              key={element}
                            />
                          </th>
                        );
                      } else {
                        return (
                          <td className={classes.data} key={'tablerowdata' + element.uniqueId}>
                            {element.value}
                          </td>
                        );
                      }
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
export default withStyles(styles)(HeatMapTable);
