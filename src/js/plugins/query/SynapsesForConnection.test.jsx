import { SynapsesForConnection } from './SynapsesForConnection';

let wrapper;
let button;
let bodyAField;
let bodyBField;
let roiSelect;

const emptyApiResponse = {
  columns: ['s.type', 's.location.x', 's.location.y', 's.location.z', 's.confidence', 'keys(s)'],
  data: [],
  debug: 'test'
};
const query = { parameters: { bodyId1: '123456', bodyId2: '645321', rois: [] } };
const apiResponse = {
  columns: ['s.type', 's.location.x', 's.location.y', 's.location.z', 's.confidence', 'keys(s)'],
  data: [
    [
      'pre',
      1.1,
      2.1,
      3.1,
      0.9839201,
      ['type', 'location', 'timeStamp', 'confidence', 'roi1', 'roi2']
    ],
    ['post', 1.0, 3.0, 3.0, 0.1, ['type', 'location', 'timeStamp', 'confidence']]
  ],
  debug: 'test'
};

const styles = { select: {}, clickable: {} };
const { actions, React, enzyme, renderer, submit } = global;

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
  beforeAll(() => {
    wrapper = enzyme.mount(component);
    button = wrapper.find('Button');
    bodyAField = wrapper.find('TextField').at(0);
    bodyBField = wrapper.find('TextField').at(1);
    roiSelect = wrapper.find('Select');
  });
  beforeEach(() => {
    submit.mockClear();
  });
  it('has name and description', () => {
    expect(SynapsesForConnection.details.name).toBeTruthy();
    expect(SynapsesForConnection.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchSnapshot();
  });
  describe('when user clicks submit', () => {
    it('should return a query object with input fields contained in cypher string and should submit', () => {
      bodyAField.props().onChange({ target: { value: '123456' } });
      bodyBField.props().onChange({ target: { value: '645321' } });

      expect(button.props().onClick()).toEqual(undefined);
      expect(submit).toHaveBeenCalledTimes(1);

      roiSelect.props().onChange([{ value: 'roi1' }, { value: 'roi2' }]);

      expect(button.props().onClick()).toEqual(undefined);
      expect(submit).toHaveBeenCalledTimes(2);
    });
  });

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
});
