import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Immutable from 'immutable';
import { render, screen, fireEvent, waitFor } from '../tests/test-utils';

import Account from './Account';
import C from '../reducers/constants';

const mockStore = configureStore([]);

function renderAccount(token = 'tok-old') {
  const store = mockStore({
    user: Immutable.Map({
      loggedIn: true,
      userInfo: { Email: 'alice@example.org', ImageURL: '', AuthLevel: 'readwrite' },
      token
    })
  });
  render(
    <Provider store={store}>
      <Account />
    </Provider>
  );
  return store;
}

function jsonResponse(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  });
}

describe('Account token revoke', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('shows the Revoke button next to the token', () => {
    renderAccount();
    const token = screen.getByText('tok-old');
    const button = screen.getByRole('button', { name: 'Revoke' });
    expect(token.parentElement).toBe(button.parentElement);
    expect(token.nextSibling).toBe(button);
  });

  it('does nothing when the confirmation is cancelled', () => {
    global.fetch = jest.fn();
    const store = renderAccount();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(store.getActions()).toEqual([]);
  });

  it('rotates the token with the old token as bearer and stores the new one', async () => {
    global.fetch = jest.fn(() => jsonResponse(200, { token: 'tok-new' }));
    const store = renderAccount();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Revoke' }).pop());

    await waitFor(() =>
      expect(store.getActions()).toEqual([{ type: C.SET_USER_TOKEN, token: 'tok-new' }])
    );
    expect(global.fetch).toHaveBeenCalledWith('/token/rotate', {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-old' }
    });
    expect(await screen.findByText(/The old token was revoked/)).toBeTruthy();
  });

  it('shows the server error and keeps the token when rotation fails', async () => {
    global.fetch = jest.fn(() => jsonResponse(403, { message: 'not allowed' }));
    const store = renderAccount();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Revoke' }).pop());

    expect(await screen.findByText('not allowed')).toBeTruthy();
    expect(store.getActions()).toEqual([]);
  });
});
