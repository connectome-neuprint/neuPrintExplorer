import { CustomQuery } from './CustomQuery';

let wrapper;
let button;
let textField;

const { actions, React, enzyme, renderer, submit } = global;

const styles = { textField: '', button: '', formControl: '' };

const component = (
  <CustomQuery
    dataSet="test"
    history={{ push: jest.fn() }}
    classes={styles}
    actions={actions}
    submit={submit}
    isQuerying={false}
  />
);

describe('custom query Plugin', () => {
  beforeAll(() => {
    wrapper = enzyme.mount(component);
    button = wrapper.find('CustomQuery').find('Button');
    textField = wrapper.find('CustomQuery').find('TextField');
  });
  beforeEach(() => {
    submit.mockClear();
  });
  it('has name and description', () => {
    expect(CustomQuery.details.name).toBeTruthy();
    expect(CustomQuery.details.description).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchSnapshot();
  });
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
    it('should submit request', () => {
      const processRequest = jest.spyOn(wrapper.find('CustomQuery').instance(), 'processRequest');
      const preventDefault = jest.fn();
      textField.props().onKeyDown({ shiftKey: true, keyCode: 13, preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(processRequest).toHaveBeenCalledTimes(1);
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
  describe('when user inputs text', () => {
    it('should change state', () => {
      actions.setQueryString.mockClear();
      textField.props().onChange({ target: { value: 'abc' } });
      expect(wrapper.find('CustomQuery').state('textValue')).toEqual('abc');
    });
  });
});
