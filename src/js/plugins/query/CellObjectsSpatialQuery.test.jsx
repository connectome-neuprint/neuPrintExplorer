import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it.each([[null], [undefined], [''], ['unknown']])(
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

  it('does not submit when the version lookup fails, and says so', async () => {
    fetch.mockRejectOnce(new Error('network down'));
    render(plugin());
    await fillCoordinates();
    clickSearch();

    expect(await screen.findByText(/Could not read the Neo4j version/)).toBeTruthy();
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

  it('submits once when Search is clicked twice during the lookup', async () => {
    fetch.mockResponse(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(kernelResponse('2026.08.1')), 20);
        })
    );
    render(plugin());
    await fillCoordinates();
    clickSearch();
    clickSearch();

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    // Give a second lookup, had one been started, time to finish.
    await new Promise((resolve) => {
      setTimeout(resolve, 60);
    });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('submits for the dataset that was selected when Search was clicked', async () => {
    fetch.mockResponse(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(kernelResponse('4.4.16')), 20);
        })
    );
    const { rerender } = render(plugin());
    await fillCoordinates();
    clickSearch();
    rerender(plugin({ dataSet: 'other' }));

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const query = submit.mock.calls[0][0];
    expect(query.dataSet).toBe('test');
    expect(query.parameters.dataset).toBe('test');
    expect(JSON.parse(fetch.mock.calls[0][1].body).dataset).toBe('test');
  });
});
