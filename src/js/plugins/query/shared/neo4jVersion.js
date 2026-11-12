// One neuPrintExplorer build talks to Neo4j servers of several generations at
// once: 3.5, 4.4 and the calendar-versioned (CalVer) line. A few Cypher
// functions exist on only some of them, so a query that needs one has to ask
// the dataset's server which generation it is.

// Pinned to the kernel row: on the CalVer line dbms.components() returns a
// second row for Cypher (versions ["5", "25"]), so reading the first row
// blind depends on row order rather than on asking for what we mean.
export const KERNEL_VERSION_CYPHER = `CALL dbms.components() YIELD name, versions
WITH name, versions WHERE name = 'Neo4j Kernel'
RETURN versions[0] as version`;

// Resolves to the kernel version of the server that holds dataSet, such as
// '3.5.3', '4.4.16' or '2026.08.1', or to null when the server returns no
// kernel row. Rejects when the request itself fails. Callers decide what a
// missing version means for them.
export function fetchKernelVersion(dataSet) {
  return fetch('/api/custom/custom?np_explorer=neo4j_version', {
    headers: {
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ cypher: KERNEL_VERSION_CYPHER, dataset: dataSet }),
    method: 'POST',
    credentials: 'include',
  })
    .then((result) => result.json())
    .then((resp) => {
      if (!resp.data || !resp.data[0]) {
        return null;
      }
      return resp.data[0][0];
    });
}

// The major version as a number: 3 for '3.5.3', 4 for '4.4.16', 5 for
// '5.26.0' and 2026 for '2026.08.1'. Returns null for anything that does not
// start with "<digits>.<digits>", so that a caller never mistakes an
// unreadable version for an old server.
export function kernelMajor(kernelVersion) {
  const match = /^(\d+)\.\d+/.exec(String(kernelVersion));
  return match ? Number(match[1]) : null;
}
