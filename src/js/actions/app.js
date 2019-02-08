import C from '../reducers/constants';

function initializingPlugins(pluginList) {
  return {
    type: C.INIT_PLUGINS,
    pluginList
  };
}
function settingUrlQS(urlQueryString) {
  return {
    type: C.SET_URL_QS,
    urlQueryString
  };
}

function settingAppDb(appDB) {
  return {
    type: C.SET_APP_DB,
    appDB
  };
}

export function initViewPlugins(pluginsMap) {
  return {
    type: C.INIT_VIEWPLUGINS,
    plugins: pluginsMap
  };
}

export function initPlugins(pluginList) {
  return initializingPlugins(pluginList);
}

export function setUrlQS(urlQueryString) {
  return settingUrlQS(urlQueryString);
}

export function setAppDb(appDb) {
  return settingAppDb(appDb);
}

export function clearErrors() {
  return {
    type: C.CLEAR_ERRORS
  };
}

export function clearNotification() {
  return {
    type: C.CLEAR_NOTIFICATION
  };
}

export function launchNotification(notification) {
  return {
    type: C.NOTIFICATION,
    notification
  };
}

export function setFullScreen(viewer) {
  return {
    type: C.SET_FULLSCREEN_VIEWER,
    viewer
  };
}

export function clearFullScreen() {
  return {
    type: C.CLEAR_FULLSCREEN_VIEWER
  };
}

export function metaInfoError(error) {
  return {
    type: C.META_INFO_ERROR,
    error
  };
}

export function apiError(error) {
  return {
    type: C.API_ERROR,
    error
  };
}

export function setSelectedResult(index) {
  return {
    type: C.APP_SET_SELECTED_RESULT,
    index
  };
}
