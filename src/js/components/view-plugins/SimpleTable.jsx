import React from 'react';
import Typography from '@material-ui/core/Typography';

class SimpleTable extends React.Component {
  render() {
    const { query } = this.props;

    console.log(query.results);
    return (
      <div>
        <Typography>Query: {query.queryString} - Data Set: {query.dataSet}</Typography>
      </div>
    );
  }
}

export default SimpleTable;
