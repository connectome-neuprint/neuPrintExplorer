// import all the plugins
// eslint-disable-next-line import/no-unresolved
const plugins = require('.');

const abbreviationList = [];

Object.keys(plugins).forEach(plugin => {
  describe(`Testing: ${plugin}`, () => {
    describe('has required functions', () => {
      test('details', () => {
        expect(plugins[plugin].details).toBeTruthy();
        abbreviationList.push(plugins[plugin].details.abbr);
      });
      test('fetchParameters', () => {
        expect(plugins[plugin].fetchParameters).toBeTruthy();
      });
    });
  });
});

describe('unique checks', () => {
  test('name', () => {

  });

  test('abbreviation', () => {
    const unique = [... new Set(abbreviationList)];
    // we should get at least one abbreviation value.
    expect(unique.length).toBeGreaterThan(0);
    // The unique list should be as long as the unfiltered list
    // if the values are all unique
    expect(unique).toHaveLength(abbreviationList.length);
  });
});
