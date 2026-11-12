import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as neo4jVersion from './shared/neo4jVersion';
import {
  CellObjectsSpatialQuery,
  buildSpatialCypher,
  distanceFunction,
} from './CellObjectsSpatialQuery';

const { submit } = global;

// MUI expects class names to be strings.
const styles = {
  textField: 'textField',
  formControl: 'formControl',
  select: 'select',
  button: 'button',
  noBodyError: 'noBodyError',
};

function plugin(props = {}) {
  return (
    <CellObjectsSpatialQuery
      dataSet="test"
      submit={submit}
      classes={styles}
      isQuerying={false}
      {...props}
    />
  );
}

function kernelResponse(version) {
  return JSON.stringify({ columns: ['version'], data: [[version]] });
}

// Make the next version lookup wait until the test answers it, so that the
// test can act while the lookup is in flight. Returns the function that
// answers it.
function deferredLookup() {
  let answer;
  fetch.mockResponseOnce(
    () =>
      new Promise((resolve) => {
        answer = resolve;
      })
  );
  return (version) => answer(kernelResponse(version));
}

// Let every pending promise settle. The lookup and its handling use only
// promises, so one turn of the event loop is enough.
function settle() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

// Type coordinates into the x, y and z fields. Radius keeps its default, 100.
async function fillCoordinates() {
  const [x, y, z] = screen.getAllByRole('textbox');
  await userEvent.type(x, '1');
  await userEvent.type(y, '2');
  await userEvent.type(z, '3');
}

// fireEvent wraps the click in act(), and it is synchronous, so two calls in a
// row land before the version lookup can finish.
function clickSearch() {
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
}

describe('distanceFunction', () => {
  it.each([
    ['3.5.3', 'distance'],
    ['4.4.16', 'distance'],
    ['5.0.0', 'point.distance'],
    ['5.26.0', 'point.distance'],
    ['2026.08.1', 'point.distance'],
  ])('for kernel %s is %s', (version, expected) => {
    expect(distanceFunction(version)).toBe(expected);
  });

  it.each([[null], [undefined], [''], ['unknown'], [{ toString: null }]])(
    'is null when the version cannot be read (%p)',
    (version) => {
      expect(distanceFunction(version)).toBeNull();
    }
  );
});

describe('buildSpatialCypher', () => {
  const point = { x: 1, y: 2, z: 3, radius: 100 };

  it('uses point.distance(), which Neo4j 5 and CalVer require', () => {
    expect(buildSpatialCypher({ ...point, distance: 'point.distance' })).toBe(
      'MATCH (n :Element) WHERE point.distance(point({x:1, y:2, z:3}), n.location) < 100 return ID(n), n.type, n'
    );
  });

  it('uses distance(), the only form Neo4j 3.5 has', () => {
    const cypher = buildSpatialCypher({ ...point, distance: 'distance' });
    expect(cypher).toBe(
      'MATCH (n :Element) WHERE distance(point({x:1, y:2, z:3}), n.location) < 100 return ID(n), n.type, n'
    );
    expect(cypher).not.toContain('point.distance');
  });

  it('filters on one type', () => {
    expect(buildSpatialCypher({ ...point, types: ['pre'], distance: 'distance' })).toContain(
      "< 100 AND (n.type = 'pre') return"
    );
  });

  it('keeps every type inside the radius', () => {
    // Without the parentheses, AND binds tighter than OR and every 'post'
    // object in the dataset would match, whatever its distance.
    expect(
      buildSpatialCypher({ ...point, types: ['pre', 'post'], distance: 'point.distance' })
    ).toContain("< 100 AND (n.type = 'pre' OR n.type = 'post') return");
  });
});

describe('spatial query Plugin', () => {
  beforeEach(() => {
    submit.mockClear();
    fetch.resetMocks();
  });

  it('has name and description', () => {
    expect(CellObjectsSpatialQuery.details.name).toBeTruthy();
    expect(CellObjectsSpatialQuery.details.description).toBeTruthy();
  });

  it.each([
    ['2026.08.1', 'point.distance(point({x:1, y:2, z:3})'],
    ['4.4.16', 'WHERE distance(point({x:1, y:2, z:3})'],
    ['3.5.3', 'WHERE distance(point({x:1, y:2, z:3})'],
  ])('asks the server for its version and submits for kernel %s', async (version, expected) => {
    fetch.mockResponseOnce(kernelResponse(version));
    render(plugin());
    await fillCoordinates();
    clickSearch();

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const query = submit.mock.calls[0][0];
    expect(query.dataSet).toBe('test');
    expect(query.parameters.cypherQuery).toContain(expected);
    expect(query.parameters).toMatchObject({ dataset: 'test', x: '1', y: '2', z: '3', radius: 100 });

    // The version came from the dataset being searched.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1].body).dataset).toBe('test');
  });

  it('does not submit when the version lookup fails, and says why', async () => {
    fetch.mockRejectOnce(new Error('network down'));
    render(plugin());
    await fillCoordinates();
    clickSearch();

    expect(
      await screen.findByText(/Could not read the Neo4j version of this dataset \(network down\)/)
    ).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
  });

  it("shows neuPrintHTTP's reason when it refuses the lookup", async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'authentication required' }), {
      status: 401,
    });
    render(plugin());
    await fillCoordinates();
    clickSearch();

    expect(await screen.findByText(/\(authentication required\), so the search was not sent/)).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
  });

  it('does not submit when the server reports no kernel version', async () => {
    fetch.mockResponseOnce(JSON.stringify({ columns: ['version'], data: [] }));
    render(plugin());
    await fillCoordinates();
    clickSearch();

    expect(await screen.findByText(/Could not read the Neo4j version/)).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits on a second try after a failed lookup', async () => {
    fetch.mockRejectOnce(new Error('network down'));
    fetch.mockResponseOnce(kernelResponse('2026.08.1'));
    render(plugin());
    await fillCoordinates();

    clickSearch();
    await screen.findByText(/Could not read the Neo4j version/);
    clickSearch();

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/Could not read the Neo4j version/)).toBeNull();
  });

  it('shows the message and accepts a new click when reading the version throws', async () => {
    const spy = jest.spyOn(neo4jVersion, 'kernelMajor').mockImplementationOnce(() => {
      throw new Error('unreadable');
    });
    fetch.mockResponseOnce(kernelResponse('2026.08.1'));
    fetch.mockResponseOnce(kernelResponse('2026.08.1'));
    render(plugin());
    await fillCoordinates();

    clickSearch();
    expect(await screen.findByText(/\(unreadable\)/)).toBeTruthy();
    clickSearch();

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    spy.mockRestore();
  });

  it('searches again after a search that succeeded', async () => {
    fetch.mockResponseOnce(kernelResponse('2026.08.1'));
    fetch.mockResponseOnce(kernelResponse('2026.08.1'));
    render(plugin());
    await fillCoordinates();

    clickSearch();
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    clickSearch();

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('submits once when Search is clicked twice during the lookup', async () => {
    const answer = deferredLookup();
    render(plugin());
    await fillCoordinates();
    clickSearch();
    clickSearch();
    answer('2026.08.1');

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('submits once when Enter is pressed twice during the lookup', async () => {
    const answer = deferredLookup();
    render(plugin());
    await fillCoordinates();
    const [x] = screen.getAllByRole('textbox');
    fireEvent.keyDown(x, { key: 'Enter', keyCode: 13 });
    fireEvent.keyDown(x, { key: 'Enter', keyCode: 13 });
    answer('2026.08.1');

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('submits the form values from the moment of the click', async () => {
    const answer = deferredLookup();
    render(plugin());
    await fillCoordinates();
    clickSearch();
    const [x] = screen.getAllByRole('textbox');
    fireEvent.change(x, { target: { value: '9' } });
    answer('2026.08.1');

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const query = submit.mock.calls[0][0];
    expect(query.parameters.x).toBe('1');
    expect(query.parameters.cypherQuery).toContain('point({x:1, y:2, z:3})');
  });

  it('submits for the dataset that was selected when Search was clicked', async () => {
    const answer = deferredLookup();
    const { rerender } = render(plugin());
    await fillCoordinates();
    clickSearch();
    rerender(plugin({ dataSet: 'other' }));
    answer('4.4.16');

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const query = submit.mock.calls[0][0];
    expect(query.dataSet).toBe('test');
    expect(query.parameters.dataset).toBe('test');
    expect(JSON.parse(fetch.mock.calls[0][1].body).dataset).toBe('test');
  });

  it('drops the search when the form goes away during the lookup', async () => {
    const answer = deferredLookup();
    const { unmount } = render(plugin());
    await fillCoordinates();
    clickSearch();
    unmount();
    answer('2026.08.1');

    await settle();
    expect(submit).not.toHaveBeenCalled();
  });

  it('drops the search when the dataset changes during the lookup, as QueryForm does it', async () => {
    // QueryForm gives the plugin key={dataSet}, so a new dataset replaces the
    // form with a new one.
    const keyed = (dataSet) => (
      <CellObjectsSpatialQuery
        key={dataSet}
        dataSet={dataSet}
        submit={submit}
        classes={styles}
        isQuerying={false}
      />
    );
    const answer = deferredLookup();
    const { rerender } = render(keyed('test'));
    await fillCoordinates();
    clickSearch();
    rerender(keyed('other'));
    answer('4.4.16');
    await settle();
    expect(submit).not.toHaveBeenCalled();

    // The new form searches its own dataset.
    fetch.mockResponseOnce(kernelResponse('4.4.16'));
    await fillCoordinates();
    clickSearch();
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    expect(submit.mock.calls[0][0].dataSet).toBe('other');
  });
});
