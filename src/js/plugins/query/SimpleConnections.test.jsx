import React from 'react';
import { render, screen, fireEvent } from '../../tests/test-utils';
import { SimpleConnections } from './SimpleConnections';

const styles = {};
const { actions, submit } = global;

const neoServerSettings = {
  get: () => 'http://example.com',
};

const renderComponent = (isPublic = false) =>
  render(
    <SimpleConnections
      availableROIs={['roiA', 'roiB', 'roiC']}
      dataSet="test"
      datasetstr="test"
      actions={actions}
      submit={submit}
      classes={styles}
      history={{ push: jest.fn() }}
      isQuerying={false}
      neoServerSettings={neoServerSettings}
      neoServer="testServer"
      isPublic={isPublic}
    />
  );

describe('SimpleConnections Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
    actions.formError.mockClear();
  });

  it('should have required details fields', () => {
    expect(SimpleConnections.details.name).toBeTruthy();
    expect(SimpleConnections.details.description).toBeTruthy();
  });

  it('renders correctly', () => {
    const { container } = renderComponent();
    expect(container).toMatchSnapshot();
  });

  it('renders correctly in public mode', () => {
    const { container } = renderComponent(true);
    expect(container).toMatchSnapshot();
  });

  it('it should not submit if there is no neuron name provided', () => {
    renderComponent();
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(submit).toHaveBeenCalledTimes(0);
  });

  it('should return a query object and submit', async () => {
    await renderComponent();

    const textField = screen.getByRole('combobox');
    const button = screen.getByRole('button');

    // Simulate input changes and button clicks
    await fireEvent.change(textField, { target: { value: 'abc' } });
    await fireEvent.click(button);
    expect(actions.formError).toHaveBeenCalledTimes(1);

  });
});

