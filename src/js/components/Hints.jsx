import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Link } from 'react-router-dom';
import MobileStepper from '@mui/material/MobileStepper';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  hint: {
    margin: `${theme.spacing(2)}px 0`,
    minHeight: '76px'
  }
});

const HintText = [
  <Typography>
    Explore high-level region-to-region projectome-level connectivity as an entry point to analysis
    with the <a href="/?openQuery=true&Query%5BqueryType%5D=ROI%20Connectivity">Brain Region Connectivity</a>{' '}
    query.
  </Typography>,
  <Typography>
    Find neurons using region-based filters with the{' '}
    <a href="/?openQuery=true&Query%5BqueryType%5D=Find%20Neurons">Find Neurons</a> query.
  </Typography>,
  <Typography>
    Click the <Link to="/help">help</Link> icon for detailed information on how the connectome data
    is stored in the graph database.
  </Typography>
];

class Hints extends React.Component {
  constructor(props) {
    super(props);
    this.state = { activeStep: 0 };
  }

  handleNext = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep + 1
    }));
  };

  handleBack = () => {
    this.setState(prevState => ({
      activeStep: prevState.activeStep - 1
    }));
  };

  render() {
    const { classes, theme } = this.props;
    const { activeStep } = this.state;
    return (
      <Card>
        <CardHeader
          className="homeCardHeader"
          title="Helpful Hints"
          avatar={
            <SvgIcon htmlColor="orange">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
            </SvgIcon>
          }
        />
        <CardContent>
          <div className={classes.hint}>{HintText[activeStep]}</div>
          <MobileStepper
            steps={HintText.length}
            position="static"
            activeStep={activeStep}
            nextButton={
              <Button
                size="small"
                onClick={this.handleNext}
                disabled={activeStep === HintText.length - 1}
              >
                Next
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            }
            backButton={
              <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                Back
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }
}

Hints.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Hints);
