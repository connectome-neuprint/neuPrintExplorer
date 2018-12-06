import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { createStore, applyMiddleware, compose } from 'redux';
import renderer from 'react-test-renderer';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';

import CustomQuery from './CustomQuery';
import AppReducers from '../../reducers';

const composeEnhancers = compose;

const store = createStore(AppReducers, {}, composeEnhancers(applyMiddleware(thunk)));
const history = createMemoryHistory('/');

let wrapper;
let button;
let textField;
let submit;

const component = (
  <Provider store={store}>
    <Router history={history}>
      <CustomQuery dataSet="test" />
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
      className="MuiFormLabel-root-19 MuiInputLabel-root-8 MuiInputLabel-formControl-13 MuiInputLabel-animated-16"
      data-shrink={false}
    >
      Custom Cypher Query
    </label>
    <div
      className="MuiInputBase-root-39 MuiInput-root-26 MuiInput-underline-30 MuiInputBase-formControl-40 MuiInput-formControl-27 MuiInputBase-multiline-47 MuiInput-multiline-32"
      onClick={[Function]}
    >
      <div
        className="MuiPrivateTextarea-root-56"
      >
        <textarea
          aria-hidden="true"
          className="MuiPrivateTextarea-textarea-57 MuiPrivateTextarea-shadow-58"
          readOnly={true}
          rows="1"
          tabIndex={-1}
          value=""
        />
        <textarea
          aria-hidden="true"
          className="MuiPrivateTextarea-textarea-57 MuiPrivateTextarea-shadow-58"
          readOnly={true}
          rows={1}
          tabIndex={-1}
          value=""
        />
        <textarea
          aria-invalid={false}
          className="MuiPrivateTextarea-textarea-57 MuiInputBase-input-49 MuiInput-input-34 MuiInputBase-inputMultiline-51 MuiInput-inputMultiline-36"
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
    className="MuiButtonBase-root-85 MuiButton-root-59 MuiButton-contained-70 MuiButton-containedPrimary-71 MuiButton-raised-73 MuiButton-raisedPrimary-74 withRouter-Connect-CustomQuery---button-2"
    disabled={false}
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
    tabIndex="0"
    type="button"
  >
    <span
      className="MuiButton-label-60"
    >
      Submit
    </span>
    <span
      className="MuiTouchRipple-root-88"
    />
  </button>
</div>
`);
  });
  describe('when user clicks submit', () => {
    it('should return a query object and submit', () => {
      submit = jest.spyOn(wrapper.find('CustomQuery').props().actions, 'submit');
      expect(button.props().onClick()).toEqual(
        expect.objectContaining({
          dataSet: 'test',
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
      textField.props().onKeyDown({ keyCode: 13, preventDefault });
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
