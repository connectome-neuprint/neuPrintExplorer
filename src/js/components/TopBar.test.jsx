import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, waitFor } from '@testing-library/react';

import { render } from '../tests/test-utils';
import { TopBar } from './TopBar';
import { setQueryString } from '../helpers/queryString';

jest.mock('./Login', () => () => null);
jest.mock('./MetaInfo', () => () => null);
jest.mock('../helpers/queryString', () => {
  const actual = jest.requireActual('../helpers/queryString');
  return {
    ...actual,
    setQueryString: jest.fn()
  };
});

const classes = {};

function topBarProps(overrides = {}) {
  return {
    classes,
    location: { pathname: '/results', search: '' },
    loggedIn: true,
    userInfo: { AuthLevel: 'user' },
    datasetInfo: { A: {}, B: {} },
    tosPending: null,
    setTosPending: jest.fn(),
    ...overrides
  };
}

function renderTopBar(overrides) {
  const ref = React.createRef();
  const props = topBarProps(overrides);
  render(
    <MemoryRouter>
      <TopBar ref={ref} {...props} />
    </MemoryRouter>
  );
  return { ref, props };
}

function accessResponse(data) {
  return {
    ok: true,
    json: () => Promise.resolve(data)
  };
}

describe('TopBar dataset access gate', () => {
  let open;

  beforeEach(() => {
    global.VERSION = 'test';
    fetch.resetMocks();
    sessionStorage.clear();
    setQueryString.mockClear();
    open = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    open.mockRestore();
  });

  it('redirects a TOS-pending deep link with the current URL as next', async () => {
    fetch.mockResponseOnce(JSON.stringify({
      access: false,
      tos_required: true,
      tos_url: 'https://tos.example/deep-link'
    }));

    renderTopBar({ location: { pathname: '/results', search: '?dataset=A&tab=3' } });

    await waitFor(() => {
      expect(open).toHaveBeenCalledWith('https://tos.example/deep-link', '_self');
    });
    expect(fetch).toHaveBeenCalledWith(
      '/dataset-access?dataset=A&next=%2Fresults%3Fdataset%3DA%26tab%3D3',
      { credentials: 'include' }
    );
    expect(sessionStorage.getItem('tosGuard:A')).toEqual('1');
  });

  it('dispatches the fallback card rather than redirecting a guarded deep link again', async () => {
    sessionStorage.setItem('tosGuard:A', '1');
    fetch.mockResponseOnce(JSON.stringify({
      access: false,
      tos_required: true,
      tos_url: 'https://tos.example/guarded'
    }));
    const { props } = renderTopBar({
      location: { pathname: '/results', search: '?dataset=A' }
    });

    await waitFor(() => {
      expect(props.setTosPending).toHaveBeenCalledWith({
        dataset: 'A',
        tosUrl: 'https://tos.example/guarded'
      });
    });
    expect(open).not.toHaveBeenCalled();
  });

  it('checks a selected dataset using a next URL that already contains that dataset', async () => {
    fetch.mockResponseOnce(JSON.stringify({ access: true }));
    const { ref } = renderTopBar({
      location: {
        pathname: '/results',
        search: '?dataset=A&plugins%5B0%5D=old&tab=2'
      }
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    fetch.mockClear();
    fetch.mockResponseOnce(JSON.stringify({ access: true }));
    await act(async () => {
      ref.current.handleChange({ value: 'B' });
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/dataset-access?dataset=B&next=%2Fresults%3Fdataset%3DB%26tab%3D2',
        { credentials: 'include' }
      );
    });
    expect(setQueryString).toHaveBeenNthCalledWith(1, { dataset: 'B' });
    expect(setQueryString).toHaveBeenNthCalledWith(2, { plugins: [] });
  });

  it('shows the fallback card without switching when a selection has no TOS URL', async () => {
    fetch.mockResponseOnce(JSON.stringify({ access: false, tos_required: true }));
    const { ref, props } = renderTopBar();

    await act(async () => {
      ref.current.handleChange({ value: 'B' });
    });

    await waitFor(() => {
      expect(props.setTosPending).toHaveBeenCalledWith({ dataset: 'B', tosUrl: null });
    });
    expect(setQueryString).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('discards reversed stale responses across an A to B to A selection sequence', async () => {
    const resolvers = [];
    fetch.mockImplementation(() => new Promise(resolve => resolvers.push(resolve)));
    const { ref, props } = renderTopBar();

    act(() => {
      ref.current.handleChange({ value: 'A' });
      ref.current.handleChange({ value: 'B' });
      ref.current.handleChange({ value: 'A' });
    });
    expect(resolvers).toHaveLength(3);

    await act(async () => {
      resolvers[2](accessResponse({ access: true }));
      await Promise.resolve();
      await Promise.resolve();
    });
    await waitFor(() => expect(setQueryString).toHaveBeenCalledTimes(2));

    await act(async () => {
      resolvers[1](accessResponse({
        access: false,
        tos_required: true,
        tos_url: 'https://tos.example/stale-b'
      }));
      resolvers[0](accessResponse({
        access: false,
        tos_required: true,
        tos_url: 'https://tos.example/stale-a'
      }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(open).not.toHaveBeenCalled();
    expect(props.setTosPending).not.toHaveBeenCalledWith(expect.objectContaining({ tosUrl: expect.any(String) }));
  });
});
