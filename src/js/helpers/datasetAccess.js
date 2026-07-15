import qs from 'qs';

const tosGuardKey = dataset => `tosGuard:${dataset}`;

export async function checkDatasetAccess(dataset, next) {
  try {
    const response = await fetch(
      `/dataset-access?dataset=${encodeURIComponent(dataset)}&next=${encodeURIComponent(next)}`,
      { credentials: 'include' }
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    return null;
  }
}

export function setTosGuard(dataset) {
  sessionStorage.setItem(tosGuardKey(dataset), '1');
}

export function clearTosGuard(dataset) {
  sessionStorage.removeItem(tosGuardKey(dataset));
}

export function hasTosGuard(dataset) {
  return sessionStorage.getItem(tosGuardKey(dataset)) === '1';
}

export function datasetAccessGate({
  origin,
  requestedGeneration,
  currentGeneration,
  result,
  guardSet
}) {
  if (requestedGeneration !== currentGeneration) {
    return { action: 'ignore' };
  }
  if (result === null) {
    return { action: 'proceed' };
  }
  if (result.access) {
    return { action: 'proceed', clearGuard: true };
  }
  if (result.tos_required) {
    if (result.tos_url && (origin === 'selection' || !guardSet)) {
      return { action: 'redirect', tosUrl: result.tos_url };
    }
    return { action: 'card', tosUrl: result.tos_url || null };
  }
  if (origin === 'selection') {
    return { action: 'deny', message: result.message };
  }
  return { action: 'proceed' };
}

export function buildDatasetNext(location, dataset) {
  const params = qs.parse(decodeURIComponent(location.search.substring(1)), {
    arrayLimit: 2000
  });
  params.dataset = dataset;
  params.plugins = [];
  const query = qs.stringify(params);
  return `${location.pathname}${query ? `?${query}` : ''}`;
}

export async function acceptTosFresh(dataset, next) {
  const result = await checkDatasetAccess(dataset, next);
  if (result && result.access) {
    clearTosGuard(dataset);
    return { cleared: true };
  }
  if (result && result.tos_required && result.tos_url) {
    setTosGuard(dataset);
    window.open(result.tos_url, '_self');
  }
  return { cleared: false };
}

export async function acceptPendingTos(dataset, location, clearPending) {
  const result = await acceptTosFresh(dataset, buildDatasetNext(location, dataset));
  if (result.cleared) {
    clearPending();
  }
  return result;
}
