import { MemoryRouter } from 'react-router-dom';
import CommonConnectivity from './CommonConnectivity';

const styles = {};
const { actions, React, enzyme, renderer, submit } = global;

const neoServerSettings = {
  get: () => 'http://example.com'
};

const raw = (
  <MemoryRouter>
    <CommonConnectivity
      actions={actions}
      submit={submit}
      dataSet="mb6"
      history={{ push: jest.fn() }}
      classes={styles}
      neoServerSettings={neoServerSettings}
    />
  </MemoryRouter>
);

function providedRenderedComponent() {
  const wrapper = enzyme.mount(raw);
  // get through the styles and router components that wrap the plugin.
  const rendered = wrapper.children().children();
  return rendered;
}

describe('Common Connectivity Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
  });

  describe('has required functions', () => {
    test('name', () => {
      expect(CommonConnectivity.details.name).toBeTruthy();
    });
    test('description', () => {
      expect(CommonConnectivity.details.description).toBeTruthy();
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

    test('typeValue should be inputs', () => {
      const inputType = rendered.find('input[name="type"]').at(0);
      expect(inputType.props().value).toEqual('input');
      expect(inputType.props().checked).toBe(true);

      const outputType = rendered.find('input[name="type"]').at(1);
      expect(outputType.props().value).toEqual('output');
      expect(outputType.props().checked).toBe(false);
    });
  });

  describe('submits correctly', () => {
    const rendered = providedRenderedComponent();
    test('submit button pressed', () => {
      rendered.find('Button').simulate('click');
      expect(submit).toHaveBeenCalledTimes(1);
    });

    test('enter key pressed in text field', () => {
      rendered
        .find('TextField')
        .at(0)
        .simulate('keyDown', { keyCode: 13 });
      expect(submit).toHaveBeenCalledTimes(1);
    });
  });
});
