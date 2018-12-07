import uuid from 'uuid';

import * as appActions from './app';
import C from '../reducers/constants';

describe('app Actions', () => {
  it('should create action to initialize plugins', () => {
    const expectedAction = {
      type: C.INIT_PLUGINS,
      pluginList: ['a', 'b'],
      reconIndex: 9
    };
    expect(appActions.initPlugins(['a', 'b'])).toEqual(expectedAction);
  });
  it('should create action to initialize view plugins', () => {
    const expectedAction = {
      type: C.INIT_VIEWPLUGINS,
      plugins: { a: 'b' }
    };
    expect(appActions.initViewPlugins({ a: 'b' })).toEqual(expectedAction);
  });
  it('should create action to set url query string', () => {
    const expectedAction = {
      type: C.SET_URL_QS,
      urlQueryString: 'abc'
    };
    expect(appActions.setUrlQS('abc')).toEqual(expectedAction);
  });
  it('should create action to activate plugin', () => {
    const uuidMock = 'testUuid';
    const v4Spy = jest.spyOn(uuid, 'v4').mockReturnValue(uuidMock);

    const expectedAction = {
      type: C.ACTIVATE_PLUGIN,
      data: [1, 2],
      query: 'testQuery',
      viz: 'testVis',
      uuid: 'testUuid'
    };

    expect(appActions.activatePlugin([1, 2], 'testQuery', 'testVis')).toEqual(expectedAction);
    expect(v4Spy).toHaveBeenCalledTimes(1);
  });
  it('should create action to set app db', () => {
    const expectedAction = {
      type: C.SET_APP_DB,
      appDB: 'testDB'
    };
    expect(appActions.setAppDb('testDB')).toEqual(expectedAction);
  });
  it('should create an action to clear errors', () => {
    const expectedAction = {
      type: C.CLEAR_ERRORS
    };
    expect(appActions.clearErrors('')).toEqual(expectedAction);
  });
  it('should create an action to set full screen', () => {
    const expectedAction = {
      type: C.SET_FULLSCREEN_VIEWER,
      viewer: 'testViewer'
    };
    expect(appActions.setFullScreen('testViewer')).toEqual(expectedAction);
  });
  it('should clear full screen', () => {
    const expectedAction = {
      type: C.CLEAR_FULLSCREEN_VIEWER
    };
    expect(appActions.clearFullScreen()).toEqual(expectedAction);
  });
});
