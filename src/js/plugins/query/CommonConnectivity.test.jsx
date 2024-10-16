import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import '@testing-library/jest-dom';
import CommonConnectivity from './CommonConnectivity';

const { actions, submit } = global;

const styles = {};

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

describe('Common Connectivity Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
    actions.metaInfoError.mockClear();
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

    it('should render', () => {
      const { asFragment } = render(raw);
      expect(asFragment()).toMatchSnapshot();
    });

    test('bodyIds should be empty', async () => {
      render(raw);
      const bodyIds = screen.getByRole('textbox');
      expect(bodyIds).toHaveValue('');
    });

    test('typeValue should be inputs', async () => {
      render(raw);
      const inputType = screen.getByRole('radio', { name: 'Inputs' });
      expect(inputType).toBeChecked();

      const outputType = screen.getByRole('radio', { name: 'Outputs' });
      expect(outputType).not.toBeChecked();
    });
  });

  describe('submits correctly', () => {
    test('submit button pressed', async () => {
      render(raw);
      const inputArea = await screen.getByRole('textbox');
      await userEvent.type( inputArea, '1234' );
      const submitButton = await screen.getByRole('button', { name: 'Submit' });
      submitButton.click();
      expect(actions.metaInfoError).toHaveBeenCalledTimes(2);
      expect(submit).toHaveBeenCalledTimes(1);
    });

    test('enter key pressed in text field', async () => {
      render(raw);
      const inputArea = await screen.getByRole('textbox');
      await userEvent.type( inputArea, '{enter}' );
      expect(actions.metaInfoError).toHaveBeenCalledTimes(2);
      expect(submit).toHaveBeenCalledTimes(0);
    });
  });
});
