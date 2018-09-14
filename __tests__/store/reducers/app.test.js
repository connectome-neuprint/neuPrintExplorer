import C from "../../../src/js/reducers/constants";
import reducer from "../../../src/js/reducers/app";
import Immutable from "immutable";

const state = Immutable.Map({
    pluginList: Immutable.List(["existingplugin"]),
    reconIndex: 2,
    urlQueryString: "existingstring",
    appDB: "existingDB",
    activePlugins: Immutable.Map({
        existingplugin : Immutable.Map({
            data: "data",
            viz: "viz",
            query: "query",
        })
    })
});

describe("app Reducer", () => {

    it("INIT_PLUGINS success", () => {
        const action = {
            type: C.INIT_PLUGINS,
            pluginList: Immutable.List(["test"]),
            reconIndex: 7
        };
        expect(reducer(undefined, action))
            .toEqual(Immutable.Map({
                pluginList: Immutable.List(["test"]),
                reconIndex: 7,
                urlQueryString: window.location.search.substring(1),
                appDB: "",
                activePlugins: Immutable.Map({})
            }));
        expect(reducer(state, action))
            .toEqual(Immutable.Map({
                pluginList: Immutable.List(["test"]),
                reconIndex: 7,
                urlQueryString: "existingstring",
                appDB: "existingDB",
                activePlugins: Immutable.Map({
                    "existingplugin": Immutable.Map({
                        data: "data",
                        viz: "viz",
                        query: "query",
                    })
                })
            }));
    })

    it("SET_URL_QS success", () => {
        const action = {
            type: C.SET_URL_QS,
            urlQueryString: "teststring"
        };
        expect(reducer(undefined, action))
            .toEqual(Immutable.Map({
                pluginList: Immutable.List([]),
                reconIndex: 9999999,
                urlQueryString: "teststring",
                appDB: "",
                activePlugins: Immutable.Map({})
            }));
        expect(reducer(state, action))
            .toEqual(Immutable.Map({
                pluginList: Immutable.List(["existingplugin"]),
                reconIndex: 2,
                urlQueryString: "teststring",
                appDB: "existingDB",
                activePlugins: Immutable.Map({
                    "existingplugin": Immutable.Map({
                        data: "data",
                        viz: "viz",
                        query: "query",
                    })
                })
            }));
    })

    it("ACTIVATE_PLUGIN success", () => {
        const action = {
            type: C.ACTIVATE_PLUGIN,
            data: "newdata",
            query: "newquery",
            viz: "newviz",
            uuid: "a"
        };
        const newDataElement = Immutable.Map({
            data: action.data,
            query: action.query,
            viz: action.viz
        });
        expect(reducer(undefined, action))
            .toEqual(Immutable.Map({
                pluginList: Immutable.List([]),
                reconIndex: 9999999,
                urlQueryString: window.location.search.substring(1),
                appDB: "",
                activePlugins: Immutable.Map({
                    a: newDataElement
                })
            }))
        expect(reducer(state, action))
            .toEqual(Immutable.Map({
                pluginList: Immutable.List(["existingplugin"]),
                reconIndex: 2,
                urlQueryString: "existingstring",
                appDB: "existingDB",
                activePlugins: Immutable.Map({
                    existingplugin: Immutable.Map({
                        data: "data",
                        viz: "viz",
                        query: "query",
                    }),
                    a: newDataElement,
                })
            }))
    })

    it("DEACTIVATE_PLUGIN success", () => {
        const action = {
            type: C.DEACTIVATE_PLUGIN,
            uuid: "existingplugin"
        };
        expect(reducer(state, action))
            .toEqual(Immutable.Map({
                pluginList: Immutable.List([
                    "existingplugin"
                ]),
                reconIndex: 2,
                urlQueryString: "existingstring",
                appDB: "existingDB",
                activePlugins:Immutable.Map({
                })
            }))
    })


})
