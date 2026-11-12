import { KERNEL_VERSION_CYPHER, fetchKernelVersion, kernelMajor } from './neo4jVersion';

describe('kernelMajor', () => {
  it.each([
    ['3.5.3', 3],
    ['4.4.16', 4],
    ['5.0.0', 5],
    ['5.26.0', 5],
    ['2025.01.0', 2025],
    ['2026.08.1', 2026],
  ])('reads %s as major version %i', (version, expected) => {
    expect(kernelMajor(version)).toBe(expected);
  });

  it.each([[null], [undefined], [''], ['not a version'], ['5'], ['v5.1'], [4.4], [{ toString: null }]])(
    'returns null for a version it cannot read (%p)',
    (version) => {
      expect(kernelMajor(version)).toBeNull();
    }
  );
});

describe('fetchKernelVersion', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('asks for the kernel row, not the first row', () => {
    // On the CalVer line dbms.components() also returns a Cypher row.
    expect(KERNEL_VERSION_CYPHER).toContain('CALL dbms.components()');
    expect(KERNEL_VERSION_CYPHER).toContain("WHERE name = 'Neo4j Kernel'");
  });

  it('posts the version query for the given dataset', async () => {
    fetch.mockResponseOnce(JSON.stringify({ columns: ['version'], data: [['2026.08.1']] }));
    const version = await fetchKernelVersion('hemibrain:v1.2.1');

    expect(version).toBe('2026.08.1');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/custom/custom?np_explorer=neo4j_version');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      cypher: KERNEL_VERSION_CYPHER,
      dataset: 'hemibrain:v1.2.1',
    });
  });

  it('resolves to null when the server returns no kernel row', async () => {
    fetch.mockResponseOnce(JSON.stringify({ columns: ['version'], data: [] }));
    await expect(fetchKernelVersion('test')).resolves.toBeNull();
  });

  it.each([[[null]], [[]], [[5]], [[{ toString: null }]]])(
    'resolves to null for a row without a version string (%j)',
    async (row) => {
      fetch.mockResponseOnce(JSON.stringify({ columns: ['version'], data: [row] }));
      await expect(fetchKernelVersion('test')).resolves.toBeNull();
    }
  );

  it.each([
    [401, { message: 'authentication required' }],
    [403, { message: 'Terms of Service acceptance required for this dataset', tos_required: true }],
    [404, { error: 'dataset "test" not available in stores' }],
  ])("rejects with neuPrintHTTP's reason on HTTP %i", async (status, body) => {
    fetch.mockResponseOnce(JSON.stringify(body), { status });
    await expect(fetchKernelVersion('test')).rejects.toThrow(body.message || body.error);
  });

  it('rejects with the HTTP status when the error page is not JSON', async () => {
    fetch.mockResponseOnce('<html>Bad Gateway</html>', { status: 502 });
    await expect(fetchKernelVersion('test')).rejects.toThrow('HTTP 502');
  });

  it('rejects on an HTTP error even when the body holds a version row', async () => {
    fetch.mockResponseOnce(JSON.stringify({ columns: ['version'], data: [['2026.08.1']] }), {
      status: 500,
    });
    await expect(fetchKernelVersion('test')).rejects.toThrow('HTTP 500');
  });

  it('rejects with the error that a 200 answer carries', async () => {
    fetch.mockResponseOnce(JSON.stringify({ error: 'no access' }));
    await expect(fetchKernelVersion('test')).rejects.toThrow('no access');
  });

  it('rejects when a 200 answer is not JSON', async () => {
    fetch.mockResponseOnce('not json');
    await expect(fetchKernelVersion('test')).rejects.toThrow();
  });

  it('rejects when the request fails', async () => {
    fetch.mockRejectOnce(new Error('network down'));
    await expect(fetchKernelVersion('test')).rejects.toThrow('network down');
  });
});
