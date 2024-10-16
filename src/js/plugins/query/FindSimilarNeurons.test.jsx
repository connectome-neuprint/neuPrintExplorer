import React from 'react'; // React import needed for JSX
import { render } from '@testing-library/react';
import { FindSimilarNeurons } from './FindSimilarNeurons';

const styles = { select: {}, clickable: {} };
const { actions, submit } = global;

const neoServerSettings = {
  get: () => 'http://example.com',
};

const renderComponent = () =>
  render(
    <FindSimilarNeurons
      superROIs={['roiA', 'roiB', 'roiC']}
      dataSet="test"
      datasetstr="test"
      actions={actions}
      submit={submit}
      classes={styles}
      history={{ push: jest.fn() }}
      isQuerying={false}
      neoServerSettings={neoServerSettings}
      neoServer="testServer"
    />
  );

describe('FindSimilarNeurons Plugin', () => {
  beforeEach(() => {
    submit.mockClear(); // Reset submit mock before each test
  });

  it('has name and description', () => {
    expect(FindSimilarNeurons.details.name).toBeTruthy();
    expect(FindSimilarNeurons.details.description).toBeTruthy();
  });

  it('renders correctly', () => {
    const { asFragment } = renderComponent(); // Render the component
    expect(asFragment()).toMatchSnapshot(); // Snapshot test
  });

  /* TODO: Fix these tests
  describe('when user hits enter key in the body id field', () => {
    it('should submit the request', () => {
      const { container } = renderComponent();
      const bodyIdField = screen.getAllByRole('textbox')[0];

      // Fire the key down event with Enter (keyCode 13)
      fireEvent.keyDown(bodyIdField, { keyCode: 13});

      // Assertions
      expect(container).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user clicks submit', () => {
    it('should return a query object and submit', () => {
      const { getByRole } = renderComponent();

      const bodyIdField = screen.getAllByRole('textbox')[0];
      const bodyIdButton = getByRole('button');

      // Simulate entering a body id in the text field
      fireEvent.change(bodyIdField, { target: { value: '122' } });

      // Simulate button click
      fireEvent.click(bodyIdButton);

      // Assert that the submit function has been called
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
  */
});
