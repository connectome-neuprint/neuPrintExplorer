import { v4 } from 'uuid';
export const INIT_PLUGINS = 'INIT_PLUGINS';
export const SET_URL_QS = 'SET_URL_QS';
export const ACTIVATE_PLUGIN = 'ACTIVATE_PLUGIN';
export const SET_APP_DB = 'SET_APP_DB';

function initializingPlugins(pluginList, reconIndex) {
    return {
        type: INIT_PLUGINS,
        pluginList,
        reconIndex,
    }
}
function settingUrlQS(urlQueryString) {
    return {
        type: SET_URL_QS,
        urlQueryString,
    }
}
function activatingPlugin(data, query, viz, uuid) {
    return {
        type: ACTIVATE_PLUGIN,
        data,
        query,
        viz,
        uuid,
    }
}
function settingAppDb(appDB) {
    return {
        type: SET_APP_DB,
        appDB
    }
}

export function initPlugins(pluginList) {
    const reconIndex = 7;
    return initializingPlugins(pluginList, reconIndex);
}
export function setUrlQS(urlQueryString) {
    return settingUrlQS(urlQueryString);
}
export function activatePlugin(data, query, viz) {
    //generate uuid
    const uuid = v4();
    return activatingPlugin(data, query, viz, uuid);
}
export function setAppDb(appDb) {
    return settingAppDb(appDb);
}