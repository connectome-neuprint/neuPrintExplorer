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

// neuPrintHTTP puts the reason for a failure in "error" or in "message".
function errorText(resp) {
  const text = resp && (resp.error || resp.message);
  return typeof text === 'string' && text !== '' ? text : null;
}

// Resolves to the kernel version of the server that holds dataSet, such as
// '3.5.3', '4.4.16' or '2026.08.1'. Resolves to null when the server returns
// no kernel row, or a row without a version string. Rejects when the request
// fails or neuPrintHTTP answers with an error; the Error then carries
// neuPrintHTTP's reason when there is one, such as "authentication required".
// Callers decide what a missing version means for them.
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
    .then((result) => {
      if (!result.ok) {
        // The body may not be JSON, for example a proxy's error page.
        return result.json().then(
          (resp) => {
            throw new Error(errorText(resp) || `HTTP ${result.status}`);
          },
          () => {
            throw new Error(`HTTP ${result.status}`);
          }
        );
      }
      return result.json();
    })
    .then((resp) => {
      // actions/plugins.js also treats an "error" field as a failure.
      if (resp && resp.error) {
        throw new Error(errorText(resp) || 'neuPrintHTTP returned an error');
      }
      const version = resp && resp.data && resp.data[0] && resp.data[0][0];
      return typeof version === 'string' ? version : null;
    });
}

// The major version as a number: 3 for '3.5.3', 4 for '4.4.16', 5 for
// '5.26.0' and 2026 for '2026.08.1'. Returns null for anything that is not a
// string starting with "<digits>.<digits>", so that a caller never mistakes
// an unreadable version for an old server.
export function kernelMajor(kernelVersion) {
  if (typeof kernelVersion !== 'string') {
    return null;
  }
  const match = /^(\d+)\.\d+/.exec(kernelVersion);
  return match ? Number(match[1]) : null;
}
