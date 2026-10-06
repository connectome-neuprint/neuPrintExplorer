import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import Immutable from 'immutable';
import { render, screen, fireEvent, waitFor } from '../tests/test-utils';

import Account from './Account';
import userReducer from '../reducers/user';

function renderAccount(token = 'tok-old') {
  const store = createStore(combineReducers({ user: userReducer }), {
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

// fetchMock answers /token/rotate with `rotate` and GET /token with `current`.
function fetchMock(rotate, current) {
  return jest.fn(url => (url === '/token/rotate' ? rotate() : current()));
}

const REGENERATE = 'Revoke & Regenerate';

function confirmRegenerate() {
  fireEvent.click(screen.getByRole('button', { name: REGENERATE }));
  expect(screen.getByText('Revoke & regenerate your token?')).toBeTruthy();
  return screen.getAllByRole('button', { name: REGENERATE }).pop();
}

describe('Account token revoke & regenerate', () => {
  afterEach(() => {
    delete global.fetch;
  });

  it('shows the Revoke & Regenerate button next to the token', () => {
    renderAccount();
    const token = screen.getByText('tok-old');
    const button = screen.getByRole('button', { name: REGENERATE });
    expect(token.parentElement).toBe(button.parentElement);
    expect(token.nextSibling).toBe(button);
  });

  it('disables Revoke & Regenerate when there is no token', () => {
    renderAccount('');
    expect(screen.getByRole('button', { name: REGENERATE }).disabled).toBe(true);
  });

  it('does nothing when the confirmation is cancelled', () => {
    global.fetch = jest.fn();
    const store = renderAccount();
    fireEvent.click(screen.getByRole('button', { name: REGENERATE }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(global.fetch).not.toHaveBeenCalled();
    expect(store.getState().user.get('token')).toBe('tok-old');
  });

  it('rotates with the old token as bearer and shows the new token', async () => {
    global.fetch = fetchMock(() => jsonResponse(200, { token: 'tok-new' }));
    const store = renderAccount();
    fireEvent.click(confirmRegenerate());

    expect(await screen.findByText('tok-new')).toBeTruthy();
    expect(screen.queryByText('tok-old')).toBeNull();
    expect(store.getState().user.get('token')).toBe('tok-new');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/token/rotate', {
      method: 'POST',
      headers: { Authorization: 'Bearer tok-old' }
    });
    expect(
      screen.getByText(/The old token was revoked and a new token generated\. Update your scripts/)
    ).toBeTruthy();
  });

  it('labels the button while the request is in flight', () => {
    global.fetch = fetchMock(() => new Promise(() => {}));
    renderAccount();
    fireEvent.click(confirmRegenerate());
    // The closing dialog still hides the page from the accessibility tree.
    const busy = screen.getByRole('button', { name: 'Revoking & Regenerating…', hidden: true });
    expect(busy.disabled).toBe(true);
  });

  it('sends one request when the confirmation is clicked twice', async () => {
    global.fetch = fetchMock(() => jsonResponse(200, { token: 'tok-new' }));
    renderAccount();
    const confirm = confirmRegenerate();
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(await screen.findByText('tok-new')).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('shows the current token when another tab already rotated it', async () => {
    global.fetch = fetchMock(
      () => jsonResponse(409, { detail: 'This token was already rotated.' }),
      () => jsonResponse(200, { token: 'tok-current' })
    );
    const store = renderAccount();
    fireEvent.click(confirmRegenerate());

    expect(await screen.findByText('tok-current')).toBeTruthy();
    expect(store.getState().user.get('token')).toBe('tok-current');
    expect(global.fetch).toHaveBeenLastCalledWith('/token', { credentials: 'include' });
  });

  it('recovers the current token when the rotation response is lost', async () => {
    global.fetch = fetchMock(
      () => Promise.reject(new Error('Failed to fetch')),
      () => jsonResponse(200, { token: 'tok-new' })
    );
    const store = renderAccount();
    fireEvent.click(confirmRegenerate());

    expect(await screen.findByText('tok-new')).toBeTruthy();
    expect(store.getState().user.get('token')).toBe('tok-new');
  });

  it('shows the server error and keeps the token when nothing changed', async () => {
    global.fetch = fetchMock(
      () => jsonResponse(403, { message: 'not allowed' }),
      () => jsonResponse(200, { token: 'tok-old' })
    );
    const store = renderAccount();
    fireEvent.click(confirmRegenerate());

    expect(await screen.findByText('not allowed')).toBeTruthy();
    expect(store.getState().user.get('token')).toBe('tok-old');
  });

  it('reports the status when the server gives no reason', async () => {
    global.fetch = fetchMock(
      () => jsonResponse(500, {}),
      () => jsonResponse(200, { token: 'tok-old' })
    );
    renderAccount();
    fireEvent.click(confirmRegenerate());

    expect(
      await screen.findByText('Revoking and regenerating the token failed (status 500).')
    ).toBeTruthy();
  });

  it('explains when the server does not support regeneration', async () => {
    global.fetch = fetchMock(() => jsonResponse(405, { message: 'Method Not Allowed' }));
    renderAccount();
    fireEvent.click(confirmRegenerate());

    expect(
      await screen.findByText('This server does not support revoking and regenerating tokens yet.')
    ).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('re-enables Revoke & Regenerate after a failure', async () => {
    global.fetch = fetchMock(
      () => jsonResponse(500, { message: 'boom' }),
      () => jsonResponse(200, { token: 'tok-old' })
    );
    renderAccount();
    fireEvent.click(confirmRegenerate());
    expect(await screen.findByText('boom')).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: REGENERATE }).disabled).toBe(false)
    );
  });
});
