import React from 'react';
import { render } from '@testing-library/react';
// eslint-disable-next-line import/no-unresolved
import '@testing-library/jest-dom';
import 'regenerator-runtime';
import { CustomQuery } from './CustomQuery';

const { submit } = global;

const styles = { textField: '', button: '', formControl: '' };

const component = (
  <CustomQuery
    dataSet="test"
    history={{ push: jest.fn() }}
    classes={styles}
    submit={submit}
    isQuerying={false}
    cypherFromOpenTab="test"
  />
);

describe('custom query Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
  });
  it('has name and description', () => {
    expect(CustomQuery.details.name).toBeTruthy();
    expect(CustomQuery.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const { asFragment } = render(component);
    expect(asFragment()).toMatchSnapshot();
  });
  /*
  describe('when user clicks submit', () => {
    it('should return a query object and submit', () => {
      expect(button.props().onClick()).toEqual(undefined);
      expect(submit).toHaveBeenCalledTimes(1);
    });

    it('should process returned results into data object', () => {
      const query = {
        dataSet: 'test',
        cypherQuery: 'test',
        visType: 'SimpleTable',
        plugin: 'CustomQuery',
        parameters: {},
        title: 'Custom query'
      };
      const apiResponse = {
        data: [[1, 2, 3], [4, 5, 6]],
        columns: ['a', 'b', 'c'],
        debug: 'test',
        title: 'Custom Query'
      };
      const processedResults = CustomQuery.processResults(query, apiResponse);
      expect(processedResults).toEqual(apiResponse);

      // if no data returned
      const processedResultsEmpty = CustomQuery.processResults(query, {});
      expect(processedResultsEmpty).toEqual({
        columns: [],
        data: [],
        debug: ''
      });
    });
  });

  describe('when user hits enter key', () => {
    test('should submit request', async () => {
      render(component);
      screen.debug();
      const textField = await screen.getByRole('textbox');
      await userEvent.type(textField, '{enter}');
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user inputs text', () => {
    it('should change state', () => {
      actions.setQueryString.mockClear();
      textField.props().onChange({ target: { value: 'abc' } });
      expect(wrapper.find('CustomQuery').state('textValue')).toEqual('abc');
    });
  }); */
});
