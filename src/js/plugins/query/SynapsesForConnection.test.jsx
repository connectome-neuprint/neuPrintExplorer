import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SynapsesForConnection } from './SynapsesForConnection';

const { actions, submit } = global;

const styles = { select: {}, clickable: {} };

const neoServerSettings = {
  get: () => 'http://example.com'
};

const component = (
  <SynapsesForConnection
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

describe('synapses for connection Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
  });
  it('has name and description', () => {
    expect(SynapsesForConnection.details.name).toBeTruthy();
    expect(SynapsesForConnection.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const { asFragment } = render(component);
    expect(asFragment()).toMatchSnapshot();
  });
  describe('when user clicks submit', () => {
    it('should return a query object with input fields contained in cypher string and should submit', async () => {
      await render(component);
      const bodyAInput = await screen.getAllByRole('textbox')[0];
      const bodyBInput = await screen.getAllByRole('textbox')[1];
      await userEvent.type( bodyAInput, '123456' );
      await userEvent.type( bodyBInput, '645321' );

      const submitButton = await screen.getByRole('button', { name: 'Submit' });
      submitButton.click();
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });

  describe('builds the roi predicate', () => {
    it('should use IS NOT NULL, which works on Neo4j 3.5 through 5.x', () => {
      const { cypherQuery } = SynapsesForConnection.fetchParameters({
        bodyId1: '123456',
        bodyId2: '645321',
        rois: ['roiA', 'roiB']
      });
      // exists(n.prop) was removed in Neo4j 5, so it must not appear.
      expect(cypherQuery).not.toContain('exists(');
      expect(cypherQuery).toContain(
        'WHERE (s.`roiA` IS NOT NULL AND s.`roiB` IS NOT NULL)'
      );
    });
    it('should omit the where clause when no roi is selected', () => {
      const { cypherQuery } = SynapsesForConnection.fetchParameters({
        bodyId1: '123456',
        bodyId2: '645321',
        rois: []
      });
      expect(cypherQuery).not.toContain('WHERE');
    });
  });

  /*
  describe('processes returned results', () => {
    it('should produce error, empty data object if results are empty', () => {
      const processedEmptyResults = SynapsesForConnection.processResults(
        {},
        emptyApiResponse,
        actions
      );
      expect(actions.pluginResponseError).toHaveBeenCalledTimes(1);
      expect(processedEmptyResults).toEqual({
        columns: [],
        data: [],
        debug: emptyApiResponse.debug,
        title: 'Synapses involved in connection between  and '
      });
    });
    it('should produce object with data rows', () => {
      const processedResults = SynapsesForConnection.processResults(query, apiResponse, actions);
      const { columns, data, debug } = processedResults;
      expect(columns).toEqual(['type', 'location', 'confidence', 'rois']);
      expect(data[0]).toEqual(['pre', '[1.1,2.1,3.1]', 0.9839, ['roi1', 'roi2']]);
      expect(data.length).toBe(2);
      expect(debug).toBe(apiResponse.debug);
    });
  });
  */
});
