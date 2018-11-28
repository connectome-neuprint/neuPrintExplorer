import * as neoQueryActions from './neoQuery';
import C from '../reducers/constants';

describe('neoQuery Actions', () => {
  it('should create set query error action', () => {
    const expectedAction = {
      type: C.SET_NEO_ERROR,
      neoError: 'testError'
    };
    expect(neoQueryActions.setQueryError('testError')).toEqual(expectedAction);
  });
  it('should create append data action', () => {
    const expectedAction = {
      type: C.APPEND_RESULTS,
      allTables: 'testTables'
    };
    expect(neoQueryActions.appendData('testTables')).toEqual(expectedAction);
  });
  it('should create save data action', () => {
    const expectedAction = {
      type: C.UPDATE_RESULTS,
      allTables: 'testTables'
    };
    expect(neoQueryActions.saveData('testTables')).toEqual(expectedAction);
  });
  it('should create finish query action', () => {
    const expectedAction = {
      type: C.FINISH_QUERY
    };
    expect(neoQueryActions.finishQuery()).toEqual(expectedAction);
  });
});
