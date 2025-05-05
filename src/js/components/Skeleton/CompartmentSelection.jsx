import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { withStyles } from '@material-ui/core/styles';
import deepEqual from 'deep-equal';

const styles = () => ({
  select: {
    width: '12em'
  }
});

class CompartmentSelection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			allRegions: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // if availableROIs or selectedROIs changed, then update.
    const { availableROIs, selectedROIs } = this.props;
    const { allRegions } = this.state;
    if (!deepEqual(nextProps.availableROIs, availableROIs)) {
      return true;
    }

    if (!deepEqual(nextProps.selectedROIs, selectedROIs)) {
      return true;
    }

    if (nextState.allRegions !== allRegions) {
      return true;
    }

    return false;
  }

  handleROIChange = chosen => {
    const {actions} = this.props;
    let chosenList = [];
    if (chosen) {
      chosenList = chosen.map(item => item.value);
    }
    actions.setROIs(chosenList);
  };

  handleRegionChange = () => {
    const { allRegions } = this.state;
    this.setState({allRegions: !allRegions});
  };

  render() {
    const { classes, availableROIs, superROIs, selectedROIs, dataSet } = this.props;
    const { allRegions } = this.state;

    let roiList = [];

    if (allRegions) {
      roiList = availableROIs[dataSet] || [];
    } else {
      roiList = superROIs[dataSet] || [];
    };

    const queryOptions = roiList.map(roi => ({
      value: roi,
      label: roi
    }));

    const selectedValue = selectedROIs.map(key => ({
      label: key,
      value: key
    }));

    return (
			<>
				<Select
					isMulti
					className={classes.select}
					value={selectedValue}
					onChange={this.handleROIChange}
					options={queryOptions}
					closeMenuOnSelect={false}
				/>
				<FormControlLabel
						control={
							<Switch
								checked={allRegions}
								onChange={this.handleRegionChange}
                color="primary"
								value="checkedA"
							/>
						}
						label="All Regions"
				/>
			</>
    );
  }
}

CompartmentSelection.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  dataSet: PropTypes.string.isRequired,
  availableROIs: PropTypes.object.isRequired,
  superROIs: PropTypes.object.isRequired,
  selectedROIs: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default withStyles(styles, { withTheme: true })(CompartmentSelection);
