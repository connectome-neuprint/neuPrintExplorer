import React from 'react'; // React import needed for JSX
import userEvent from '@testing-library/user-event';
import { act, render, waitFor } from '../../../tests/test-utils';
import NeuronInputField from './NeuronInputField';

const processRequest = jest.fn();
const addNeuronInstance = jest.fn();

const component = (
  <NeuronInputField
    onChange={addNeuronInstance}
    value='test'
    dataSet='foo'
    handleSubmit={processRequest}
  />
);

describe('NeuronInputField', () => {
  it('renders correctly', () => {
    const { asFragment} = render(component);
    expect(asFragment()).toMatchSnapshot(); // Snapshot test
  });
});

// The name search uses its fast query only when the server is 4.4 or later
// and its fulltext index is ONLINE. These tests pin that choice for each
// answer to the version lookup.
describe('NeuronInputField version check', () => {
  const answer = (rows) => JSON.stringify({ columns: ['value'], data: rows });
  const sentCypher = () => fetch.mock.calls.map(([, options]) => JSON.parse(options.body).cypher);

  // Let the version lookup, and the index check if one starts, finish.
  const settle = () =>
    act(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, 0);
        })
    );

  beforeEach(() => {
    fetch.resetMocks();
  });

  it.each([
    ['3.5.3', answer([['3.5.3']])],
    ['no kernel row', answer([])],
    ['a row without a version string', answer([[null]])],
  ])('skips the index check for %s', async (label, versionAnswer) => {
    fetch.mockResponseOnce(versionAnswer);
    render(component);
    await settle();

    expect(sentCypher()).toHaveLength(1);
    expect(sentCypher()[0]).toContain('CALL dbms.components()');
  });

  it('skips the index check when the version lookup fails', async () => {
    fetch.mockRejectOnce(new Error('network down'));
    render(component);
    await settle();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['4.4.16', 'ONLINE', 'db.index.fulltext.queryNodes'],
    ['2026.08.1', 'ONLINE', 'db.index.fulltext.queryNodes'],
    ['2026.08.1', 'POPULATING', 'MATCH (n:Neuron)'],
    ['4.4.16', 'missing', 'MATCH (n:Neuron)'],
    ['3.5.3', 'not checked', 'MATCH (n:Neuron)'],
  ])('on %s with the index %s, the name search sends %s', async (version, state, marker) => {
    const checksIndex = state !== 'not checked';
    fetch.mockResponseOnce(answer([[version]]));
    if (checksIndex) {
      fetch.mockResponseOnce(state === 'missing' ? answer([]) : answer([[state]]));
    }
    fetch.mockResponseOnce(answer([])); // the name search
    const { container } = render(component);
    await settle();

    await userEvent.type(container.querySelector('#search-neuron-input'), 'KC');
    // The name search waits 300 ms after the last key.
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(checksIndex ? 3 : 2), {
      timeout: 2000,
    });
    await settle();

    const cypher = sentCypher();
    if (checksIndex) {
      expect(cypher[1]).toContain('SHOW INDEXES');
    }
    expect(cypher[cypher.length - 1]).toContain(marker);
  });
});
