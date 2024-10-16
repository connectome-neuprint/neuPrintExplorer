import React from 'react';
import { render } from '@testing-library/react';
import { ShortestPath } from './ShortestPath';

const { actions, submit } = global;

const styles = { select: {}, clickable: {} };

const neoServerSettings = {
  get: () => 'http://example.com'
};

const component = (
  <ShortestPath
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
  />
);

describe('shortest path Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
  });
  it('has name and description', () => {
    expect(ShortestPath.details.name).toBeTruthy();
    expect(ShortestPath.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
		const { asFragment } = render(component);
  	expect(asFragment()).toMatchSnapshot();
  });
  describe('when user clicks submit', () => {
    it('should return a query object with input fields contained in cypher string and should submit', () => {
		  const { getByRole } = render(component);
      getByRole('button', { name: 'Submit' }).click();
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
});
