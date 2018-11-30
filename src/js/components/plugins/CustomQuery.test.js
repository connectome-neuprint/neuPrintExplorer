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
            <CustomQuery disable={false} />
          </Router>
        </Provider>
      )
      .toJSON();
    expect(pluginView).toMatchInlineSnapshot(`
<div
  className="MuiFormControl-root-3 withRouter-Connect-FreeForm---formControl-2"
>
  <div
    className="MuiFormControl-root-3 withRouter-Connect-FreeForm---textField-1"
    onKeyDown={[Function]}
  >
    <label
      className="MuiFormLabel-root-14 MuiInputLabel-root-7 MuiInputLabel-formControl-8 MuiInputLabel-animated-11"
      data-shrink={false}
    >
      Custom Cypher Query
    </label>
    <div
      className="MuiInputBase-root-34 MuiInput-root-21 MuiInput-underline-25 MuiInputBase-formControl-35 MuiInput-formControl-22 MuiInputBase-multiline-42 MuiInput-multiline-27"
      onClick={[Function]}
    >
      <div
        className="MuiPrivateTextarea-root-51"
      >
        <textarea
          aria-hidden="true"
          className="MuiPrivateTextarea-textarea-52 MuiPrivateTextarea-shadow-53"
          readOnly={true}
          rows="1"
          tabIndex={-1}
          value=""
        />
        <textarea
          aria-hidden="true"
          className="MuiPrivateTextarea-textarea-52 MuiPrivateTextarea-shadow-53"
          readOnly={true}
          rows={1}
          tabIndex={-1}
          value=""
        />
        <textarea
          aria-invalid={false}
          className="MuiPrivateTextarea-textarea-52 MuiInputBase-input-44 MuiInput-input-29 MuiInputBase-inputMultiline-46 MuiInput-inputMultiline-31"
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
    className="MuiButtonBase-root-80 MuiButton-root-54 MuiButton-contained-65 MuiButton-raised-68"
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
      className="MuiButton-label-55"
    >
      Submit
    </span>
    <span
      className="MuiTouchRipple-root-83"
    />
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
