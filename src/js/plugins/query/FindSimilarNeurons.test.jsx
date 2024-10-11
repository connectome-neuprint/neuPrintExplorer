import { FindSimilarNeurons } from './FindSimilarNeurons';

const styles = { select: {}, clickable: {} };
const { actions, React, enzyme, renderer, submit } = global;

let wrapper;
let bodyIdButton;
let bodyIdField;

const neoServerSettings = {
  get: () => 'http://example.com'
};

const component = (
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
describe('find similar neurons Plugin', () => {
  beforeAll(() => {
    wrapper = enzyme.mount(component);
    bodyIdButton = wrapper.find('Button').at(0);
    bodyIdField = wrapper.find('TextField');
  });
  beforeEach(() => {
    submit.mockClear();
  });
  it('has name and description', () => {
    expect(FindSimilarNeurons.details.name).toBeTruthy();
    expect(FindSimilarNeurons.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchSnapshot();
  });
  describe('when user hits enter key below body id field', () => {
    it('should submit request', () => {
      const processRequest = jest.spyOn(wrapper.instance(), 'processIDRequest');
      const preventDefault = jest.fn();
      bodyIdField.props().onKeyDown({ keyCode: 13, preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(processRequest).toHaveBeenCalledTimes(1);
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
  describe('when user clicks submit', () => {
    it('should return a query object and submit', () => {
      // input a body id
      const bodyId = 122;
      bodyIdField.props().onChange({ target: { value: bodyId } });
      expect(bodyIdButton.props().onClick()).toEqual(undefined);
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
});
