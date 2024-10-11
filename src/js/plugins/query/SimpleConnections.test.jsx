import { SimpleConnections } from './SimpleConnections';

const styles = {};
const { actions, React, renderer, submit, enzyme } = global;

let wrapper;
let button;
let textField;
let radioGroup;

const neoServerSettings = {
  get: () => 'http://example.com'
};

const component = (
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
    isPublic={false}
  />
);

const componentPublic = (
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
    isPublic
  />
);

describe('SimpleConnections Plugin', () => {
  beforeAll(() => {
    wrapper = enzyme.mount(component);
    button = wrapper.find('Button');
    textField = wrapper.find('TextField');
    radioGroup = wrapper.find('RadioGroup');
  });
  beforeEach(() => {
    submit.mockClear();
  });
  it('should have required details fields', () => {
    expect(SimpleConnections.details.name).toBeTruthy();
    expect(SimpleConnections.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchSnapshot();
  });
  it('renders correctly in public mode', () => {
    const pluginViewPublic = renderer.create(componentPublic).toJSON();
    expect(pluginViewPublic).toMatchSnapshot();
  });
  it('it should not submit if there is no neuron name provided', () => {
    expect(button.props().onClick()).toEqual({}); // returns an empty object
    button.props().onClick();
    expect(submit).toHaveBeenCalledTimes(0);
  });
  it('should return a query object and submit', () => {
    const baseQueryObject = {
      dataSet: 'test',
      plugin: 'SimpleConnection',
      pluginCode: 'sc',
      visProps: { paginateExpansion: true }
    };
    // neuron name/id and pre/postsynaptic selection add to parameters
    textField.props().onChange({ target: { value: 'abc' } });
    expect(button.props().onClick()).toEqual({
      ...baseQueryObject,
      parameters: { dataset: 'test', neuron_name: 'abc', find_inputs: false } // default pre/post selection ("find_inputs") is set to false
    });

    radioGroup.props().onChange({ target: { value: 'pre' } });
    expect(button.props().onClick()).toEqual({
      ...baseQueryObject,
      parameters: { dataset: 'test', neuron_name: 'abc', find_inputs: true } // 'pre' indicates that this plugin should look for presynaptic connections i.e. inputs
    });

    textField.props().onChange({ target: { value: '123' } });
    expect(button.props().onClick()).toEqual({
      ...baseQueryObject,
      parameters: { dataset: 'test', neuron_id: 123, find_inputs: true }
    });

    radioGroup.props().onChange({ target: { value: 'post' } });
    textField.props().onChange({ target: { value: '123' } });
    expect(button.props().onClick()).toEqual({
      ...baseQueryObject,
      parameters: { dataset: 'test', neuron_id: 123, find_inputs: false }
    });

    // all submissions should have been made
    expect(submit).toHaveBeenCalledTimes(4);
  });
});
