import React from 'react'; // React import needed for JSX
import { render } from '@testing-library/react';
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

