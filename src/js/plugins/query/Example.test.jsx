import { MemoryRouter } from 'react-router-dom';
import Example from './Example';

const styles = {};
const { actions, React, enzyme, renderer, submit } = global;

const neoServerSettings = {
  get: () => 'http://example.com'
};

const raw = (
  <MemoryRouter>
    <Example
      actions={actions}
      submit={submit}
      dataSet="mb6"
      history={{ push: jest.fn() }}
      classes={styles}
      neoServerSettings={neoServerSettings}
      isQuerying={false}
    />
  </MemoryRouter>
);

function providedRenderedComponent() {
  const wrapper = enzyme.mount(raw);
  // get through the styles and router components that wrap the plugin.
  const rendered = wrapper
    .children()
    .children()
    .children();
  return rendered;
}

describe('Example Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
    actions.setQueryString.mockClear();
    global.queryStringObject = {};
  });

  describe('has required functions', () => {
    test('name', () => {
      expect(Example.details.name).toBeTruthy();
    });
    test('description', () => {
      expect(Example.details.description).toBeTruthy();
    });
  });

  describe('renders correct defaults', () => {
    const rendered = providedRenderedComponent();

    it('should render', () => {
      const component = renderer.create(raw);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    test('bodyIds should be empty', () => {
      expect(
        rendered
          .find('textarea')
          .at(2)
          .props().value
      ).toEqual('');
    });

    test('Query String should be empty', () => {
      const query = rendered.find('TextField').at(0);
      expect(query.props().value).toEqual('');
    });
  });

  describe('handles user input', () => {
    const rendered = providedRenderedComponent();
    test('query text change triggers state change', () => {
      // can't use .find('TextField').simulate as it wont trigger the onChange
      // method.
      rendered
        .find('textarea')
        .at(2)
        .simulate('change', { target: { value: 'test me' } });
      expect(rendered.state('textValue')).toEqual('test me');
    });
  });

  describe('submits defaults correctly', () => {
    const rendered = providedRenderedComponent();
    test('submit button pressed', () => {
      rendered.find('Button').simulate('click');
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });

  describe('submits changed text correctly', () => {
    const rendered = providedRenderedComponent();
    test('submit button pressed', () => {
      // change the query text
      rendered
        .find('textarea')
        .at(2)
        .simulate('change', { target: { value: 'test me' } });
      rendered.find('Button').simulate('click');
      expect(submit).toHaveBeenCalledTimes(1);
      expect(submit.mock.calls[0][0].parameters.textValue).toEqual('test me');
    });
  });
});
