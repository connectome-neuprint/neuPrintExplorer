/* This plugin generates a table from supplied data.
 *
 * The core component of the plugin is the class definition,
 * which extends a react component.
 *
 *
 */
import React from 'react';
import PropTypes from 'prop-types';

// Here we are importing components to generate a table from material-ui.
// For other views we would need to import different code. eg: if we wanted
// to draw a bar chart or line graph, we might import the code from http://recharts.org/
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

// Since we are extending a react component, we need to generate a class and
// provide the minimum number of fuctcions from the React life-cycle so that it
// will work. The only required class method for a simple view is the render()
// method.

// eslint-disable-next-line react/prefer-stateless-function
class Example extends React.Component {
  // The render method takes no direct arguments, but there will be information
  // passed in as properties to the class. Generally this will come in the form of
  // a query object. It will have the following format:
  //  query {
  //    result: {},
  //    dataSet: "", // string containing the name of the dataset selected for the query
  //    menuColor: "#xxxxxx", // hex string used to label the results header.
  //    parameters: {}, // the input parameters selected to generate the results
  //    plugin: "", // string containing the name of the query plugin.
  //    queryString: "", // query string used by the neuprint API.
  //    title: "", // title string to be used for the results.
  //    visType: "" // string that should match the name of this plugin.
  //  }
  //
  render() {
    const { query } = this.props;

    const { highlightIndex } = query.result;

    // In this example we write out a table header and then loop over the result
    // column header names to create the table header. Once that is done loop over the
    // result.data array and print out each table row.
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              {query.result.columns.map((header, index) => {
                const headerKey = `${header}${index}`;
                return <TableCell key={headerKey}>{header}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {query.result.data.map((row, index) => {
              let rowStyle = {};
              const currspot = index;
              if (highlightIndex && currspot.toString() in highlightIndex) {
                rowStyle = {
                  backgroundColor: highlightIndex[currspot.toString()]
                };
              }
              const key = index;
              return (
                <TableRow hover key={key} style={rowStyle}>
                  {row.map((cell, i) => {
                    if (cell && typeof cell === 'object' && 'value' in cell) {
                      const cellKey = `${i}${cell.value}`;
                      if ('action' in cell) {
                        return <TableCell key={cellKey}>{cell.value}</TableCell>;
                      }
                      return <TableCell key={cellKey}>{cell.value}</TableCell>;
                    }
                    const cellKey = `${i}${cell}`;
                    return <TableCell key={cellKey}>{cell}</TableCell>;
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}

Example.propTypes = {
  query: PropTypes.object.isRequired
};

export default Example;
