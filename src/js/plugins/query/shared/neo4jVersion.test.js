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

  it.each([[null], [undefined], [''], ['not a version'], ['5'], ['v5.1']])(
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
    const version = await fetchKernelVersion('wasp3:v0.8');

    expect(version).toBe('2026.08.1');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/api/custom/custom');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      cypher: KERNEL_VERSION_CYPHER,
      dataset: 'wasp3:v0.8',
    });
  });

  it('resolves to null when the server returns no kernel row', async () => {
    fetch.mockResponseOnce(JSON.stringify({ columns: ['version'], data: [] }));
    await expect(fetchKernelVersion('test')).resolves.toBeNull();
  });

  it('resolves to null when the response carries an error and no data', async () => {
    fetch.mockResponseOnce(JSON.stringify({ error: 'no access' }));
    await expect(fetchKernelVersion('test')).resolves.toBeNull();
  });

  it('rejects when the request fails', async () => {
    fetch.mockRejectOnce(new Error('network down'));
    await expect(fetchKernelVersion('test')).rejects.toThrow('network down');
  });
});
