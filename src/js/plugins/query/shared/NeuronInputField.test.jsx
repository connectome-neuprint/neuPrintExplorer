import NeuronInputField from './NeuronInputField';

let wrapper;
let textField;

const { React, enzyme, renderer } = global;

const processRequest = jest.fn();
const addNeuronInstance = jest.fn();

const component = (
  <NeuronInputField
    onChange={addNeuronInstance}
    value='test'
    handleSubmit={processRequest}
  />
);

describe('NeuronInputField', () => {
  beforeAll(() => {
    wrapper = enzyme.mount(component);
    textField = wrapper.find('TextField').at(0);
  });

  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchSnapshot();
  });

  describe('when enter key is pressed', () => {
    it('should call the callback', () => {
      const preventDefault = jest.fn();
      textField.props().onKeyDown({ keyCode: 13, preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(processRequest).toHaveBeenCalledTimes(1);
    });
  });

});

