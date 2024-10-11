import { ShortestPath } from './ShortestPath';

let wrapper;
let button;
let bodyAField;
let bodyBField;
let minWeightField;
const emptyApiResponse = {
  columns: ['length(path)', 'ids', 'weights'],
  data: [],
  debug: 'test'
};
const apiResponse = {
  columns: ['length(path)', 'ids', 'weights'],
  data: [
    [3, [[758065781, 'a'], [5813020577, 'b'], [481112669, 'c'], [8000, 'd']], [3, 5, 9]],
    [3, [[758065781, 'a'], [5813020577, 'b'], [9000, 'e'], [8000, 'd']], [3, 4, 6]]
  ],
  debug: 'test'
};

const styles = { select: {}, clickable: {} };
const { actions, React, enzyme, renderer, submit } = global;

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
  beforeAll(() => {
    wrapper = enzyme.mount(component);
    button = wrapper.find('Button');
    bodyAField = wrapper.find('TextField').at(0);
    bodyBField = wrapper.find('TextField').at(1);
    minWeightField = wrapper.find('TextField').at(2);
  });
  beforeEach(() => {
    submit.mockClear();
  });
  it('has name and description', () => {
    expect(ShortestPath.details.name).toBeTruthy();
    expect(ShortestPath.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchSnapshot();
  });
  describe('when user clicks submit', () => {
    it('should return a query object with input fields contained in cypher string and should submit', () => {
      bodyAField.props().onChange({ target: { value: '123456' } });
      bodyBField.props().onChange({ target: { value: '645321' } });
      minWeightField.props().onChange({ target: { value: '6' } });

      expect(button.props().onClick()).toEqual(undefined);
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });

  describe('processes returned results', () => {
    it('should produce error, empty data object if results are empty', () => {
      const processedEmptyResults = ShortestPath.processResults(
        {},
        emptyApiResponse,
        actions,
        submit
      );
      expect(actions.pluginResponseError).toHaveBeenCalledTimes(1);
      expect(processedEmptyResults).toEqual({
        columns: emptyApiResponse.columns,
        data: emptyApiResponse.data,
        debug: emptyApiResponse.debug
      });
    });
    it('should produce object with raw neo4j results as "data" (for csv) and graph nodes and edges as "graph" (for cytoscape)', () => {
      const processedResults = ShortestPath.processResults({}, apiResponse);
      const { columns, data, graph, debug } = processedResults;
      expect(columns).toBe(apiResponse.columns);
      expect(data).toBe(apiResponse.data);
      expect(debug).toBe(apiResponse.debug);
      const { elements, minWeight, maxWeight } = graph;
      expect(minWeight).toBe(3);
      expect(maxWeight).toBe(9);
      const { nodes, edges } = elements;
      expect(nodes.length).toBe(5);
      expect(edges.length).toBe(5);
    });
  });
});
