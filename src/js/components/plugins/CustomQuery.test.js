import CustomQuery from './CustomQuery';
import AppReducers from '../../reducers';
import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import { createStore, applyMiddleware, compose } from 'redux';
import renderer from 'react-test-renderer';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(AppReducers, {}, composeEnhancers(applyMiddleware(thunk)));
const history = createMemoryHistory('/');

let wrapper;
let button;
let textField;
let submit;

const component = (
  <Provider store={store}>
    <Router history={history}>
      <CustomQuery />
    </Router>
  </Provider>
);

describe('custom query Plugin', () => {
  beforeAll(() => {
    wrapper = mount(component);
    button = wrapper.find('CustomQuery').find('Button');
    textField = wrapper.find('CustomQuery').find('TextField');
    submit = jest.spyOn(wrapper.find('CustomQuery').props().actions, 'submit');
  });
  beforeEach(() => {
    submit.mockReset();
  });
  it('has name and description', () => {
    expect(CustomQuery.queryName).toBeTruthy();
    expect(CustomQuery.queryDescription).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchInlineSnapshot(`
<div
  className="MuiFormControl-root-4 withRouter-Connect-CustomQuery---formControl-3"
>
  <div
    className="MuiFormControl-root-4 withRouter-Connect-CustomQuery---textField-1"
    onKeyDown={[Function]}
  >
    <label
      className="MuiFormLabel-root-15 MuiInputLabel-root-8 MuiInputLabel-formControl-9 MuiInputLabel-animated-12"
      data-shrink={false}
    >
      Custom Cypher Query
    </label>
    <div
      className="MuiInputBase-root-35 MuiInput-root-22 MuiInput-underline-26 MuiInputBase-formControl-36 MuiInput-formControl-23 MuiInputBase-multiline-43 MuiInput-multiline-28"
      onClick={[Function]}
    >
      <div
        className="MuiPrivateTextarea-root-52"
      >
        <textarea
          aria-hidden="true"
          className="MuiPrivateTextarea-textarea-53 MuiPrivateTextarea-shadow-54"
          readOnly={true}
          rows="1"
          tabIndex={-1}
          value=""
        />
        <textarea
          aria-hidden="true"
          className="MuiPrivateTextarea-textarea-53 MuiPrivateTextarea-shadow-54"
          readOnly={true}
          rows={1}
          tabIndex={-1}
          value=""
        />
        <textarea
          aria-invalid={false}
          className="MuiPrivateTextarea-textarea-53 MuiInputBase-input-45 MuiInput-input-30 MuiInputBase-inputMultiline-47 MuiInput-inputMultiline-32"
          disabled={false}
          onBlur={[Function]}
          onChange={[Function]}
          onFocus={[Function]}
          required={false}
          rows={1}
          style={
            Object {
              "height": 19,
            }
          }
          value=""
        />
      </div>
    </div>
  </div>
  <button
    className="MuiButtonBase-root-81 MuiButtonBase-disabled-82 MuiButton-root-55 MuiButton-contained-66 MuiButton-containedPrimary-67 MuiButton-raised-69 MuiButton-raisedPrimary-70 MuiButton-disabled-75 withRouter-Connect-CustomQuery---button-2"
    disabled={true}
    onBlur={[Function]}
    onClick={[Function]}
    onFocus={[Function]}
    onKeyDown={[Function]}
    onKeyUp={[Function]}
    onMouseDown={[Function]}
    onMouseLeave={[Function]}
    onMouseUp={[Function]}
    onTouchEnd={[Function]}
    onTouchMove={[Function]}
    onTouchStart={[Function]}
    tabIndex="-1"
    type="button"
  >
    <span
      className="MuiButton-label-56"
    >
      Submit
    </span>
  </button>
</div>
`);
  });
  describe('when user clicks submit', () => {
    it('should return a query object and submit', () => {
      submit = jest.spyOn(wrapper.find('CustomQuery').props().actions, 'submit');
      expect(button.props().onClick()).toEqual(
        expect.objectContaining({
          dataSet: undefined,
          cypherQuery: '',
          visType: 'SimpleTable',
          plugin: 'CustomQuery',
          parameters: {},
          title: 'Custom query',
          menuColor: expect.any(String),
          processResults: expect.any(Function)
        })
      );
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
      const apiResponse = { data: [[1, 2, 3], [4, 5, 6]], columns: ['a', 'b', 'c'], debug: 'test' };
      const processedResults = wrapper
        .find('CustomQuery')
        .instance()
        .processResults(query, apiResponse);
      expect(processedResults).toEqual(apiResponse);

      // if no data returned
      const processedResultsEmpty = wrapper
        .find('CustomQuery')
        .instance()
        .processResults(query, {});
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
      textField.props().onKeyDown({ keyCode: 13, preventDefault: preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(processRequest).toHaveBeenCalledTimes(1);
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
  describe('when user inputs text', () => {
    it('should change url query string in state', () => {
      const setUrlQs = jest.spyOn(wrapper.find('CustomQuery').props().actions, 'setURLQs');
      textField.props().onChange({ target: { value: 'abc' } });
      expect(wrapper.find('CustomQuery').state('qsParams').textValue).toBe('abc');
      expect(setUrlQs).toHaveBeenCalledTimes(1);
    });
  });
});
