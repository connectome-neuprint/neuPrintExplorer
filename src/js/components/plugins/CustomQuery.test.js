import CustomQuery from './CustomQuery';
import AppReducers from '../../reducers';
import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { createStore, applyMiddleware, compose } from 'redux';
import renderer from 'react-test-renderer';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(AppReducers, {}, composeEnhancers(applyMiddleware(thunk)));
const history = createMemoryHistory('/');

describe('custom query Plugin', () => {
  it('renders correctly', () => {
    const pluginView = renderer
      .create(
        <Provider store={store}>
          <Router history={history}>
            <CustomQuery />
          </Router>
        </Provider>
      )
      .toJSON();
    expect(pluginView).toMatchInlineSnapshot(`
<div
  className="MuiFormControl-root-4 withRouter-Connect-FreeForm---formControl-3"
>
  <div
    className="MuiFormControl-root-4 withRouter-Connect-FreeForm---textField-1"
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
    className="MuiButtonBase-root-81 MuiButtonBase-disabled-82 MuiButton-root-55 MuiButton-contained-66 MuiButton-containedPrimary-67 MuiButton-raised-69 MuiButton-raisedPrimary-70 MuiButton-disabled-75 withRouter-Connect-FreeForm---button-2"
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
    it('should submit a request to neuprinthttp', () => {});
    it('should process returned results from neuprinthttp', () => {});
  });
  describe('when user hits enter key', () => {
    it('should submit request', () => {});
  });
  describe('when user types input into text box', () => {
    it('should save parameters to url', () => {});
  });
});
