import { addSearchToQuery, setQueryString } from './queryString';

describe('queryString', () => {
  it('adds a search to the query string', () => {
    const updated = addSearchToQuery({ testSearch: 'test', files: [1,2,3] });
    expect(updated).toEqual(
      'qr%5B0%5D%5BtestSearch%5D=test&qr%5B0%5D%5Bfiles%5D%5B0%5D=1&qr%5B0%5D%5Bfiles%5D%5B1%5D=2&qr%5B0%5D%5Bfiles%5D%5B2%5D=3&tab=0'
    );

    expect(addSearchToQuery({ query: 'test2', dataset: 'random' })).toEqual(
      'qr%5B0%5D%5Bquery%5D=test2&qr%5B0%5D%5Bdataset%5D=random&tab=0'
    );
  });

  it('correctly sets a query string', () => {
    setQueryString({ testSearch: 'test', qr:[ {query: 'test2', files: [1,2,3] }]});
    setQueryString({ testSearch: 'test', qr:[ {query: 'test2', files: [3,4,5] }]});
    expect(addSearchToQuery({ query: 'test2', dataset: 'random', files: [3,4,5] })).toEqual(
      'testSearch=test&qr%5B0%5D%5Bquery%5D=test2&qr%5B0%5D%5Bfiles%5D%5B0%5D=3&qr%5B0%5D%5Bfiles%5D%5B1%5D=4&qr%5B0%5D%5Bfiles%5D%5B2%5D=5&qr%5B1%5D%5Bquery%5D=test2&qr%5B1%5D%5Bdataset%5D=random&qr%5B1%5D%5Bfiles%5D%5B0%5D=3&qr%5B1%5D%5Bfiles%5D%5B1%5D=4&qr%5B1%5D%5Bfiles%5D%5B2%5D=5&tab=1'
    );
  });
});
