import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import deepEqual from 'deep-equal';

const styles = () => ({
  select: {
    width: '10em'
  }
});

class CompartmentSelection extends React.Component {
  shouldComponentUpdate(nextProps) {
    // if availableROIs or selectedROIs changed, then update.
    const { availableROIs, selectedROIs } = this.props;
    if (!deepEqual(nextProps.availableROIs, availableROIs)) {
      return true;
    }

    if (!deepEqual(nextProps.selectedROIs, selectedROIs)) {
      return true;
    }

    return false;
  }

  handleROIChange = chosen => {
    const {actions} = this.props;
    const chosenList = chosen.map(item => item.value);
    actions.setROIs(chosenList);
  };

  render() {
    const { classes, availableROIs, selectedROIs, dataSet } = this.props;

    const roiList = availableROIs[dataSet] || [];

    const queryOptions = roiList.map(roi => ({
      value: roi,
      label: roi
    }));

    const selectedValue = selectedROIs.map(key => ({
      label: key,
      value: key
    }));

    return (
      <Select
        isMulti
        className={classes.select}
        value={selectedValue}
        onChange={this.handleROIChange}
        options={queryOptions}
        closeMenuOnSelect={false}
      />
    );
  }
}

CompartmentSelection.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  availableROIs: PropTypes.object.isRequired,
  selectedROIs: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default withStyles(styles, { withTheme: true })(CompartmentSelection);
