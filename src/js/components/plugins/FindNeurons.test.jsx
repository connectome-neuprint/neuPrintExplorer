import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { createStore, applyMiddleware, compose } from 'redux';
import renderer from 'react-test-renderer';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';
import FindNeurons from './FindNeurons';
import AppReducers from '../../reducers';
import { ColorLegend } from '../visualization/MiniRoiHeatMap';

const composeEnhancers = compose;

const store = createStore(AppReducers, {}, composeEnhancers(applyMiddleware(thunk)));
const history = createMemoryHistory('/');

let wrapper;
let button;
let textField;
let submit;
let inputSelect;
let outputSelect;
let limitNeuronsToggle;
let preThresholdField;
let postThresholdField;

const component = (
  <Provider store={store}>
    <Router history={history}>
      <FindNeurons availableROIs={['roiA', 'roiB', 'roiC']} dataSet="test" datasetstr="test" />
    </Router>
  </Provider>
);

describe('find neurons Plugin', () => {
  beforeAll(() => {
    wrapper = mount(component);
    button = wrapper.find('FindNeurons').find('Button');
    textField = wrapper
      .find('FindNeurons')
      .find('TextField')
      .at(0);
    limitNeuronsToggle = wrapper.find('FindNeurons').find('Switch');
    preThresholdField = wrapper
      .find('FindNeurons')
      .find('TextField')
      .at(1);
    postThresholdField = wrapper
      .find('FindNeurons')
      .find('TextField')
      .at(2);
    submit = jest.spyOn(wrapper.find('FindNeurons').props().actions, 'submit');
    inputSelect = wrapper.find('Select').at(0);
    outputSelect = wrapper.find('Select').at(1);
  });
  beforeEach(() => {
    submit.mockReset();
  });
  it('has name and description', () => {
    expect(FindNeurons.queryName).toBeTruthy();
    expect(FindNeurons.queryDescription).toBeTruthy();
  });
  it('renders correctly', () => {
    const pluginView = renderer.create(component).toJSON();
    expect(pluginView).toMatchInlineSnapshot(`
<div>
  <label
    className="MuiFormLabel-root-14 MuiInputLabel-root-3 MuiInputLabel-animated-11"
    htmlFor="select-multiple-chip"
  >
    Input ROIs
  </label>
  <div
    className="css-10nd86i Connect-FindNeurons--select-1"
    onKeyDown={[Function]}
  >
    <div
      className="css-vj8t7z"
      onMouseDown={[Function]}
      onTouchEnd={[Function]}
    >
      <div
        className="css-1hwfws3"
      >
        <div
          className="css-1492t68"
        >
          Select...
        </div>
        <div
          className="css-1g6gooi"
        >
          <div
            className=""
            style={
              Object {
                "display": "inline-block",
              }
            }
          >
            <input
              aria-autocomplete="list"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              disabled={false}
              id="react-select-5-input"
              onBlur={[Function]}
              onChange={[Function]}
              onFocus={[Function]}
              spellCheck="false"
              style={
                Object {
                  "background": 0,
                  "border": 0,
                  "boxSizing": "content-box",
                  "color": "inherit",
                  "fontSize": "inherit",
                  "opacity": 1,
                  "outline": 0,
                  "padding": 0,
                  "width": "1px",
                }
              }
              tabIndex="0"
              type="text"
              value=""
            />
            <div
              style={
                Object {
                  "height": 0,
                  "left": 0,
                  "overflow": "scroll",
                  "position": "absolute",
                  "top": 0,
                  "visibility": "hidden",
                  "whiteSpace": "pre",
                }
              }
            >
              
            </div>
          </div>
        </div>
      </div>
      <div
        className="css-1wy0on6"
      >
        <span
          className="css-d8oujb"
        />
        <div
          aria-hidden="true"
          className="css-1ep9fjw"
          onMouseDown={[Function]}
          onTouchEnd={[Function]}
        >
          <svg
            aria-hidden="true"
            className="css-19bqh2r"
            focusable="false"
            height={20}
            viewBox="0 0 20 20"
            width={20}
          >
            <path
              d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
  <label
    className="MuiFormLabel-root-14 MuiInputLabel-root-3 MuiInputLabel-animated-11"
    htmlFor="select-multiple-chip"
  >
    Output ROIs
  </label>
  <div
    className="css-10nd86i Connect-FindNeurons--select-1"
    onKeyDown={[Function]}
  >
    <div
      className="css-vj8t7z"
      onMouseDown={[Function]}
      onTouchEnd={[Function]}
    >
      <div
        className="css-1hwfws3"
      >
        <div
          className="css-1492t68"
        >
          Select...
        </div>
        <div
          className="css-1g6gooi"
        >
          <div
            className=""
            style={
              Object {
                "display": "inline-block",
              }
            }
          >
            <input
              aria-autocomplete="list"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              disabled={false}
              id="react-select-6-input"
              onBlur={[Function]}
              onChange={[Function]}
              onFocus={[Function]}
              spellCheck="false"
              style={
                Object {
                  "background": 0,
                  "border": 0,
                  "boxSizing": "content-box",
                  "color": "inherit",
                  "fontSize": "inherit",
                  "opacity": 1,
                  "outline": 0,
                  "padding": 0,
                  "width": "1px",
                }
              }
              tabIndex="0"
              type="text"
              value=""
            />
            <div
              style={
                Object {
                  "height": 0,
                  "left": 0,
                  "overflow": "scroll",
                  "position": "absolute",
                  "top": 0,
                  "visibility": "hidden",
                  "whiteSpace": "pre",
                }
              }
            >
              
            </div>
          </div>
        </div>
      </div>
      <div
        className="css-1wy0on6"
      >
        <span
          className="css-d8oujb"
        />
        <div
          aria-hidden="true"
          className="css-1ep9fjw"
          onMouseDown={[Function]}
          onTouchEnd={[Function]}
        >
          <svg
            aria-hidden="true"
            className="css-19bqh2r"
            focusable="false"
            height={20}
            viewBox="0 0 20 20"
            width={20}
          >
            <path
              d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
  <div
    className="MuiFormControl-root-21 MuiFormControl-fullWidth-24"
  >
    <div>
      <div
        className="MuiFormControl-root-21 MuiFormControl-fullWidth-24"
        onKeyDown={[Function]}
      >
        <label
          className="MuiFormLabel-root-14 MuiInputLabel-root-3 MuiInputLabel-formControl-8 MuiInputLabel-animated-11"
          data-shrink={false}
        >
          Neuron name (optional)
        </label>
        <div
          className="MuiInputBase-root-39 MuiInput-root-26 MuiInput-underline-30 MuiInputBase-fullWidth-48 MuiInput-fullWidth-33 MuiInputBase-formControl-40 MuiInput-formControl-27 MuiInputBase-multiline-47 MuiInput-multiline-32"
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
      <p
        aria-describedby={null}
        className="MuiTypography-root-66 MuiTypography-body1-75 MuiTypography-colorError-100 NeuronHelp-badge-25"
        onBlur={[Function]}
        onFocus={[Function]}
        onMouseLeave={[Function]}
        onMouseOver={[Function]}
        onTouchEnd={[Function]}
        onTouchStart={[Function]}
        title="Enter body ID, neuron name, or wildcard names using period+star (e.g., MBON.*). Warning: if using regular expressions, special characters like parentheses must be escaped (e.g. Delta6g\\\\\\\\(preQ7\\\\\\\\).*)"
      >
        ?
      </p>
    </div>
  </div>
  <div
    className="Connect-NeuronFilter--expandablePanel-102"
  >
    <div
      className="MuiPaper-root-110 MuiPaper-elevation1-113 MuiExpansionPanel-root-107"
    >
      <div
        aria-expanded={false}
        className="MuiButtonBase-root-143 MuiExpansionPanelSummary-root-137"
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
        role="button"
        tabIndex="0"
      >
        <div
          className="MuiExpansionPanelSummary-content-141"
        >
          <h6
            className="MuiTypography-root-66 MuiTypography-subtitle1-84"
          >
            Optional neuron/segment filters
          </h6>
        </div>
        <div
          aria-hidden="true"
          className="MuiButtonBase-root-143 MuiIconButton-root-146 MuiExpansionPanelSummary-expandIcon-142"
          onBlur={[Function]}
          onFocus={[Function]}
          onKeyDown={[Function]}
          onKeyUp={[Function]}
          onMouseDown={[Function]}
          onMouseLeave={[Function]}
          onMouseUp={[Function]}
          onTouchEnd={[Function]}
          onTouchMove={[Function]}
          onTouchStart={[Function]}
          role="button"
          tabIndex={-1}
        >
          <span
            className="MuiIconButton-label-151"
          >
            <svg
              aria-hidden="true"
              className="MuiSvgIcon-root-152"
              focusable="false"
              role="presentation"
              viewBox="0 0 24 24"
            >
              <path
                d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
              />
              <path
                d="M0 0h24v24H0z"
                fill="none"
              />
            </svg>
          </span>
          <span
            className="MuiTouchRipple-root-226"
          />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="MuiCollapse-container-161"
        style={
          Object {
            "minHeight": "0px",
          }
        }
      >
        <div
          className="MuiCollapse-wrapper-163"
        >
          <div
            className="MuiCollapse-wrapperInner-164"
          >
            <div
              className="MuiExpansionPanelDetails-root-165 Connect-NeuronFilter--nopad-103"
            >
              <div
                className="MuiFormControl-root-21 Connect-NeuronFilter--formControl-101"
              >
                <div
                  className="MuiFormControl-root-21 Connect-NeuronFilter--formControl-101"
                >
                  <label
                    className="MuiFormControlLabel-root-166"
                  >
                    <span
                      className="MuiSwitch-root-172"
                    >
                      <span
                        className="MuiButtonBase-root-143 MuiIconButton-root-146 MuiPrivateSwitchBase-root-181 MuiSwitch-switchBase-175 MuiSwitch-colorPrimary-177 MuiPrivateSwitchBase-checked-182 MuiSwitch-checked-176"
                        onBlur={[Function]}
                        onFocus={[Function]}
                        onKeyDown={[Function]}
                        onKeyUp={[Function]}
                        onMouseDown={[Function]}
                        onMouseLeave={[Function]}
                        onMouseUp={[Function]}
                        onTouchEnd={[Function]}
                        onTouchMove={[Function]}
                        onTouchStart={[Function]}
                        tabIndex={null}
                      >
                        <span
                          className="MuiIconButton-label-151"
                        >
                          <span
                            className="MuiSwitch-icon-173 MuiSwitch-iconChecked-174"
                          />
                          <input
                            checked={true}
                            className="MuiPrivateSwitchBase-input-184"
                            disabled={false}
                            onChange={[Function]}
                            type="checkbox"
                          />
                        </span>
                        <span
                          className="MuiTouchRipple-root-226"
                        />
                      </span>
                      <span
                        className="MuiSwitch-bar-180"
                      />
                    </span>
                    <span
                      className="MuiTypography-root-66 MuiTypography-body1-75 MuiFormControlLabel-label-171"
                    >
                      <h6
                        className="MuiTypography-root-66 MuiTypography-subtitle1-84"
                        style={
                          Object {
                            "display": "inline-flex",
                          }
                        }
                      >
                        Limit to neurons
                        <div
                          aria-describedby={null}
                          className="Connect-NeuronFilter--tooltip-106"
                          onBlur={[Function]}
                          onFocus={[Function]}
                          onMouseLeave={[Function]}
                          onMouseOver={[Function]}
                          onTouchEnd={[Function]}
                          onTouchStart={[Function]}
                          title="Limit to neurons (bodies with >=2 t-bars, >=10 psds, name, soma, or status)"
                        >
                          ?
                        </div>
                      </h6>
                    </span>
                  </label>
                </div>
                <div
                  className="MuiFormControl-root-21 MuiFormControl-marginDense-23 Connect-NeuronFilter--textField-105"
                >
                  <label
                    className="MuiFormLabel-root-14 MuiInputLabel-root-3 MuiInputLabel-formControl-8 MuiInputLabel-animated-11 MuiInputLabel-marginDense-9 MuiInputLabel-outlined-13"
                    data-shrink={false}
                  >
                    minimum # pre (optional)
                  </label>
                  <div
                    className="MuiInputBase-root-39 MuiOutlinedInput-root-185 MuiInputBase-formControl-40 MuiInputBase-marginDense-46"
                    onClick={[Function]}
                  >
                    <fieldset
                      aria-hidden={true}
                      className="MuiPrivateNotchedOutline-root-198 MuiOutlinedInput-notchedOutline-192"
                      style={
                        Object {
                          "paddingLeft": 8,
                        }
                      }
                    >
                      <legend
                        className="MuiPrivateNotchedOutline-legend-199"
                        style={
                          Object {
                            "width": 0.01,
                          }
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={
                            Object {
                              "__html": "&#8203;",
                            }
                          }
                        />
                      </legend>
                    </fieldset>
                    <input
                      aria-invalid={false}
                      className="MuiInputBase-input-49 MuiOutlinedInput-input-193 MuiInputBase-inputType-52 MuiInputBase-inputMarginDense-50 MuiOutlinedInput-inputMarginDense-194"
                      disabled={false}
                      onBlur={[Function]}
                      onChange={[Function]}
                      onFocus={[Function]}
                      required={false}
                      rows={1}
                      type="number"
                      value=""
                    />
                  </div>
                </div>
                <div
                  className="MuiFormControl-root-21 MuiFormControl-marginDense-23 Connect-NeuronFilter--textField-105"
                >
                  <label
                    className="MuiFormLabel-root-14 MuiInputLabel-root-3 MuiInputLabel-formControl-8 MuiInputLabel-animated-11 MuiInputLabel-marginDense-9 MuiInputLabel-outlined-13"
                    data-shrink={false}
                  >
                    minimum # post (optional)
                  </label>
                  <div
                    className="MuiInputBase-root-39 MuiOutlinedInput-root-185 MuiInputBase-formControl-40 MuiInputBase-marginDense-46"
                    onClick={[Function]}
                  >
                    <fieldset
                      aria-hidden={true}
                      className="MuiPrivateNotchedOutline-root-198 MuiOutlinedInput-notchedOutline-192"
                      style={
                        Object {
                          "paddingLeft": 8,
                        }
                      }
                    >
                      <legend
                        className="MuiPrivateNotchedOutline-legend-199"
                        style={
                          Object {
                            "width": 0.01,
                          }
                        }
                      >
                        <span
                          dangerouslySetInnerHTML={
                            Object {
                              "__html": "&#8203;",
                            }
                          }
                        />
                      </legend>
                    </fieldset>
                    <input
                      aria-invalid={false}
                      className="MuiInputBase-input-49 MuiOutlinedInput-input-193 MuiInputBase-inputType-52 MuiInputBase-inputMarginDense-50 MuiOutlinedInput-inputMarginDense-194"
                      disabled={false}
                      onBlur={[Function]}
                      onChange={[Function]}
                      onFocus={[Function]}
                      required={false}
                      rows={1}
                      type="number"
                      value=""
                    />
                  </div>
                </div>
                <div
                  className="MuiFormControl-root-21 Connect-NeuronFilter--formControl-101"
                >
                  <label
                    className="MuiFormLabel-root-14"
                    style={
                      Object {
                        "display": "inline-flex",
                      }
                    }
                  >
                    Filter by status
                    <div
                      aria-describedby={null}
                      className="Connect-NeuronFilter--tooltip-106"
                      onBlur={[Function]}
                      onFocus={[Function]}
                      onMouseLeave={[Function]}
                      onMouseOver={[Function]}
                      onTouchEnd={[Function]}
                      onTouchStart={[Function]}
                      title=""
                    >
                      ?
                    </div>
                  </label>
                  <div
                    className="css-10nd86i Connect-NeuronFilter--select-104"
                    onKeyDown={[Function]}
                  >
                    <div
                      className="css-vj8t7z"
                      onMouseDown={[Function]}
                      onTouchEnd={[Function]}
                    >
                      <div
                        className="css-1hwfws3"
                      >
                        <div
                          className="css-1492t68"
                        >
                          Select...
                        </div>
                        <div
                          className="css-1g6gooi"
                        >
                          <div
                            className=""
                            style={
                              Object {
                                "display": "inline-block",
                              }
                            }
                          >
                            <input
                              aria-autocomplete="list"
                              autoCapitalize="none"
                              autoComplete="off"
                              autoCorrect="off"
                              disabled={false}
                              id="react-select-7-input"
                              onBlur={[Function]}
                              onChange={[Function]}
                              onFocus={[Function]}
                              spellCheck="false"
                              style={
                                Object {
                                  "background": 0,
                                  "border": 0,
                                  "boxSizing": "content-box",
                                  "color": "inherit",
                                  "fontSize": "inherit",
                                  "opacity": 1,
                                  "outline": 0,
                                  "padding": 0,
                                  "width": "1px",
                                }
                              }
                              tabIndex="0"
                              type="text"
                              value=""
                            />
                            <div
                              style={
                                Object {
                                  "height": 0,
                                  "left": 0,
                                  "overflow": "scroll",
                                  "position": "absolute",
                                  "top": 0,
                                  "visibility": "hidden",
                                  "whiteSpace": "pre",
                                }
                              }
                            >
                              
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="css-1wy0on6"
                      >
                        <span
                          className="css-d8oujb"
                        />
                        <div
                          aria-hidden="true"
                          className="css-1ep9fjw"
                          onMouseDown={[Function]}
                          onTouchEnd={[Function]}
                        >
                          <svg
                            aria-hidden="true"
                            className="css-19bqh2r"
                            focusable="false"
                            height={20}
                            viewBox="0 0 20 20"
                            width={20}
                          >
                            <path
                              d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <button
    className="MuiButtonBase-root-143 MuiButton-root-200 MuiButton-contained-211 MuiButton-containedPrimary-212 MuiButton-raised-214 MuiButton-raisedPrimary-215"
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
      className="MuiButton-label-201"
    >
      Submit
    </span>
    <span
      className="MuiTouchRipple-root-226"
    />
  </button>
</div>
`);
  });
  describe('when user clicks submit', () => {
    it('should return a query object and submit', () => {
      expect(button.props().onClick()).toEqual(
        expect.objectContaining({
          dataSet: 'test',
          queryString: '/npexplorer/findneurons',
          visType: 'SimpleTable',
          visProps: { rowsPerPage: 25 },
          plugin: 'FindNeurons',
          parameters: {
            dataset: 'test',
            input_ROIs: [],
            output_ROIs: [],
            all_segments: false,
            statuses: []
          },
          title: 'Neurons with inputs in [] and outputs in []',
          menuColor: expect.any(String),
          processResults: expect.any(Function)
        })
      );
      expect(submit).toHaveBeenCalledTimes(1);

      // if neuron name/id is present add to parameters
      textField.props().onChange({ target: { value: 'abc' } });
      expect(button.props().onClick()).toEqual(
        expect.objectContaining({
          dataSet: 'test',
          menuColor: expect.any(String),
          parameters: {
            dataset: 'test',
            input_ROIs: [],
            neuron_name: 'abc',
            output_ROIs: [],
            all_segments: false,
            statuses: []
          },
          plugin: 'FindNeurons',
          processResults: expect.any(Function),
          queryString: '/npexplorer/findneurons',
          title: 'Neurons with inputs in [] and outputs in []',
          visProps: { rowsPerPage: 25 },
          visType: 'SimpleTable'
        })
      );
      textField.props().onChange({ target: { value: '123' } });
      expect(button.props().onClick()).toEqual(
        expect.objectContaining({
          dataSet: 'test',
          menuColor: expect.any(String),
          parameters: {
            dataset: 'test',
            input_ROIs: [],
            neuron_id: 123,
            output_ROIs: [],
            all_segments: false,
            statuses: []
          },
          plugin: 'FindNeurons',
          processResults: expect.any(Function),
          queryString: '/npexplorer/findneurons',
          title: 'Neurons with inputs in [] and outputs in []',
          visProps: { rowsPerPage: 25 },
          visType: 'SimpleTable'
        })
      );

      // if input/output rois present add to parameters
      textField.props().onChange({ target: { value: '' } });
      inputSelect.props().onChange([{ value: 'roiA' }]);
      outputSelect.props().onChange([{ value: 'roiB' }]);
      expect(button.props().onClick()).toEqual(
        expect.objectContaining({
          dataSet: 'test',
          menuColor: expect.any(String),
          parameters: {
            dataset: 'test',
            input_ROIs: ['roiA'],
            output_ROIs: ['roiB'],
            all_segments: false,
            statuses: []
          },
          plugin: 'FindNeurons',
          processResults: expect.any(Function),
          queryString: '/npexplorer/findneurons',
          title: 'Neurons with inputs in [roiA] and outputs in [roiB]',
          visProps: { rowsPerPage: 25 },
          visType: 'SimpleTable'
        })
      );

      // if neuron/segment filters present add to parameters
      limitNeuronsToggle.props().onChange();
      preThresholdField.props().onChange({ target: { value: 12 } });
      postThresholdField.props().onChange({ target: { value: 13 } });
      expect(button.props().onClick()).toEqual(
        expect.objectContaining({
          dataSet: 'test',
          menuColor: expect.any(String),
          parameters: {
            dataset: 'test',
            input_ROIs: ['roiA'],
            output_ROIs: ['roiB'],
            all_segments: true,
            pre_threshold: 12,
            post_threshold: 13,
            statuses: []
          },
          plugin: 'FindNeurons',
          processResults: expect.any(Function),
          queryString: '/npexplorer/findneurons',
          title: 'Neurons with inputs in [roiA] and outputs in [roiB]',
          visProps: { rowsPerPage: 25 },
          visType: 'SimpleTable'
        })
      );
    });
    it('should process returned results into data object', () => {
      const query = {
        dataSet: 'test',
        queryString: '/npexplorer/findneurons',
        visType: 'SimpleTable',
        plugin: 'FindNeurons',
        visProps: { rowsPerPage: 25 },
        parameters: {
          dataset: 'test',
          input_ROIs: [],
          output_ROIs: [],
          all_segments: false,
          statuses: []
        },
        title: 'Neurons with inputs in [] and outputs in []'
      };
      const apiResponse = {
        data: [
          [
            1,
            'KC-s',
            'Traced',
            '{"alpha1":{"pre":22,"post":28},"alpha2":{"pre":23,"post":31},"alpha3":{"pre":45,"post":61}}',
            37325787,
            90,
            120,
            ['alpha2', 'alpha3', 'alpha1'],
            true
          ]
        ],
        columns: [
          'id',
          'neuron',
          'status',
          '#post (inputs)',
          '#pre (outputs)',
          '#voxels',
          <div>
            roi heatmap <ColorLegend />
          </div>,
          'roi breakdown'
        ],
        debug: 'test'
      };
      const processedResults = wrapper
        .find('FindNeurons')
        .instance()
        .processResults(query, apiResponse);
      expect(processedResults).toEqual(
        expect.objectContaining({
          columns: apiResponse.columns,
          data: expect.arrayContaining([]),
          debug: 'test'
        })
      );

      // if no data returned
      const processedResultsEmpty = wrapper
        .find('FindNeurons')
        .instance()
        .processResults(query, {
          columns: [],
          data: [],
          debug: 'test'
        });
      expect(processedResultsEmpty).toEqual({
        columns: [
          'id',
          'neuron',
          'status',
          '#post (inputs)',
          '#pre (outputs)',
          '#voxels',
          <div>
            roi heatmap <ColorLegend />
          </div>,
          'roi breakdown'
        ],
        data: [],
        debug: 'test'
      });
    });
  });
  describe('when user hits enter key', () => {
    it('should submit request', () => {
      const processRequest = jest.spyOn(wrapper.find('FindNeurons').instance(), 'processRequest');
      const preventDefault = jest.fn();
      textField.props().onKeyDown({ keyCode: 13, preventDefault });
      expect(preventDefault).toHaveBeenCalledTimes(1);
      expect(processRequest).toHaveBeenCalledTimes(1);
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
  describe('when user inputs text or selects rois', () => {
    it('should change url query string in state', () => {
      const setUrlQs = jest.spyOn(wrapper.find('FindNeurons').props().actions, 'setURLQs');
      // neuron name input
      textField.props().onChange({ target: { value: 'abc' } });
      expect(wrapper.find('FindNeurons').state('qsParams').neuronName).toBe('abc');
      expect(setUrlQs).toHaveBeenCalledTimes(1);

      // input rois
      inputSelect.props().onChange([{ value: 'roiA' }, { value: 'roiB' }]);
      expect(wrapper.find('FindNeurons').state('qsParams').inputROIs).toContainEqual('roiA');
      expect(wrapper.find('FindNeurons').state('qsParams').inputROIs).toContainEqual('roiB');
      expect(wrapper.find('FindNeurons').state('qsParams').inputROIs.length).toBe(2);
      expect(setUrlQs).toHaveBeenCalledTimes(2);

      // output rois
      outputSelect.props().onChange([{ value: 'roiB' }, { value: 'roiC' }]);
      expect(wrapper.find('FindNeurons').state('qsParams').outputROIs).toContainEqual('roiC');
      expect(wrapper.find('FindNeurons').state('qsParams').outputROIs).toContainEqual('roiB');
      expect(wrapper.find('FindNeurons').state('qsParams').outputROIs.length).toBe(2);
      expect(setUrlQs).toHaveBeenCalledTimes(3);
    });
  });
  describe('when selected dataset changes', () => {
    it('should clear selected rois', () => {
      inputSelect.props().onChange([{ value: 'roiA' }, { value: 'roiB' }]);
      outputSelect.props().onChange([{ value: 'roiB' }, { value: 'roiC' }]);
      textField.props().onChange({ target: { value: 'abc' } });

      wrapper.setProps({
        children: React.cloneElement(wrapper.props().children, {
          children: React.cloneElement(wrapper.props().children.props.children, {
            dataSet: 'new'
          })
        })
      });
      const findNeuronsWrapper = wrapper.children().find('FindNeurons');
      expect(findNeuronsWrapper.props().dataSet).toBe('new');
      expect(findNeuronsWrapper.state('qsParams').inputROIs.length).toBe(0);
      expect(findNeuronsWrapper.state('qsParams').outputROIs.length).toBe(0);
      // input text does not change
      expect(findNeuronsWrapper.state('qsParams').neuronName).toBe('abc');
    });
  });
});
