import {
  acceptPendingTos,
  acceptTosFresh,
  buildDatasetNext,
  checkDatasetAccess,
  clearTosGuard,
  datasetAccessGate,
  hasTosGuard,
  setTosGuard
} from './datasetAccess';

describe('dataset access helpers', () => {
  let open;

  beforeEach(() => {
    fetch.resetMocks();
    sessionStorage.clear();
    open = jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    open.mockRestore();
  });

  it('encodes dataset and intended next URL in the access check', async () => {
    fetch.mockResponseOnce(JSON.stringify({ access: true }));

    await expect(checkDatasetAccess('dataset / one', '/results?dataset=A B&tab=1')).resolves.toEqual({
      access: true
    });
    expect(fetch).toHaveBeenCalledWith(
      '/dataset-access?dataset=dataset%20%2F%20one&next=%2Fresults%3Fdataset%3DA%20B%26tab%3D1',
      { credentials: 'include' }
    );
  });

  it('fails open when the access check is non-OK or fails on the network', async () => {
    fetch.mockResponseOnce('', { status: 403 });
    await expect(checkDatasetAccess('dataset', '/results')).resolves.toBeNull();

    fetch.mockRejectOnce(new Error('network unavailable'));
    await expect(checkDatasetAccess('dataset', '/results')).resolves.toBeNull();
  });

  it('builds a selected-dataset next URL and resets plugins', () => {
    expect(
      buildDatasetNext(
        { pathname: '/results', search: '?dataset=A&plugins%5B0%5D=old&tab=2' },
        'B'
      )
    ).toEqual('/results?dataset=B&tab=2');
  });

  it('returns the access gate matrix outcomes', () => {
    const access = { access: true };
    const tos = { access: false, tos_required: true, tos_url: 'https://tos.example/one' };
    const tosWithoutUrl = { access: false, tos_required: true };
    const deny = { access: false, message: 'No access to this dataset' };

    expect(datasetAccessGate({ origin: 'load', requestedGeneration: 1, currentGeneration: 1, result: access, guardSet: true })).toEqual({ action: 'proceed', clearGuard: true });
    expect(datasetAccessGate({ origin: 'load', requestedGeneration: 1, currentGeneration: 1, result: tos, guardSet: false })).toEqual({ action: 'redirect', tosUrl: tos.tos_url });
    expect(datasetAccessGate({ origin: 'load', requestedGeneration: 1, currentGeneration: 1, result: tos, guardSet: true })).toEqual({ action: 'card', tosUrl: tos.tos_url });
    expect(datasetAccessGate({ origin: 'selection', requestedGeneration: 1, currentGeneration: 1, result: tos, guardSet: true })).toEqual({ action: 'redirect', tosUrl: tos.tos_url });
    expect(datasetAccessGate({ origin: 'selection', requestedGeneration: 1, currentGeneration: 1, result: tosWithoutUrl, guardSet: false })).toEqual({ action: 'card', tosUrl: null });
    expect(datasetAccessGate({ origin: 'selection', requestedGeneration: 1, currentGeneration: 1, result: deny, guardSet: false })).toEqual({ action: 'deny', message: deny.message });
    expect(datasetAccessGate({ origin: 'load', requestedGeneration: 1, currentGeneration: 1, result: deny, guardSet: false })).toEqual({ action: 'proceed' });
    expect(datasetAccessGate({ origin: 'load', requestedGeneration: 1, currentGeneration: 1, result: null, guardSet: true })).toEqual({ action: 'proceed' });
    expect(datasetAccessGate({ origin: 'load', requestedGeneration: 1, currentGeneration: 2, result: tos, guardSet: false })).toEqual({ action: 'ignore' });
  });

  it('uses a one-shot per-dataset session guard', () => {
    const tos = { access: false, tos_required: true, tos_url: 'https://tos.example/one' };

    expect(hasTosGuard('dataset')).toBe(false);
    setTosGuard('dataset');
    expect(sessionStorage.getItem('tosGuard:dataset')).toEqual('1');
    expect(hasTosGuard('dataset')).toBe(true);
    expect(datasetAccessGate({ origin: 'load', requestedGeneration: 1, currentGeneration: 1, result: tos, guardSet: hasTosGuard('dataset') })).toEqual({ action: 'card', tosUrl: tos.tos_url });
    clearTosGuard('dataset');
    expect(hasTosGuard('dataset')).toBe(false);
  });

  it('freshly accepts TOS by clearing access or guarding before navigation', async () => {
    setTosGuard('dataset');
    fetch.mockResponseOnce(JSON.stringify({ access: true }));
    await expect(acceptTosFresh('dataset', '/results?dataset=dataset')).resolves.toEqual({ cleared: true });
    expect(hasTosGuard('dataset')).toBe(false);

    fetch.mockResponseOnce(JSON.stringify({
      access: false,
      tos_required: true,
      tos_url: 'https://tos.example/fresh'
    }));
    await expect(acceptTosFresh('dataset', '/results?dataset=dataset')).resolves.toEqual({ cleared: false });
    expect(hasTosGuard('dataset')).toBe(true);
    expect(open).toHaveBeenLastCalledWith('https://tos.example/fresh', '_self');

    fetch.mockRejectOnce(new Error('network unavailable'));
    await expect(acceptTosFresh('dataset', '/results?dataset=dataset')).resolves.toEqual({ cleared: false });
    expect(hasTosGuard('dataset')).toBe(true);
  });

  it('rechecks pending TOS with the pending dataset next URL before clearing the card', async () => {
    const clearPending = jest.fn();
    fetch.mockResponseOnce(JSON.stringify({ access: true }));

    await expect(
      acceptPendingTos('B', { pathname: '/results', search: '?dataset=A&plugins%5B0%5D=old' }, clearPending)
    ).resolves.toEqual({ cleared: true });
    expect(fetch).toHaveBeenCalledWith(
      '/dataset-access?dataset=B&next=%2Fresults%3Fdataset%3DB',
      { credentials: 'include' }
    );
    expect(clearPending).toHaveBeenCalledTimes(1);
  });
});
