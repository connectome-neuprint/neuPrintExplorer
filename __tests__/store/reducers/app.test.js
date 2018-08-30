import C from "../../../src/js/reducers/constants"
import reducer from "../../../src/js/reducers/app"

const state = {
    pluginList: ["existingplugin"],
    reconIndex: 2,
    urlQueryString: "existingstring",
}

describe("app Reducer", () => {

    it("INIT_PLUGINS success", () => {
        const action = {
            type: C.INIT_PLUGINS,
            pluginList: ["test"],
            reconIndex: 7
        };
        expect(reducer(undefined, action))
            .toEqual({
                pluginList: ["test"],
                reconIndex: 7,
                urlQueryString: window.location.search.substring(1)
            });
        expect(reducer(state, action))
            .toEqual({
                pluginList: ["test"],
                reconIndex: 7,
                urlQueryString: "existingstring"
            });
    })

    it("SET_URL_QS success", () => {
        const action = {
            type: C.SET_URL_QS,
            urlQueryString: "teststring"
        };
        expect(reducer(undefined, action))
            .toEqual({
                pluginList: [],
                reconIndex: 9999999,
                urlQueryString: "teststring"
            });
        expect(reducer(state, action))
            .toEqual({
                pluginList: ["existingplugin"],
                reconIndex: 2,
                urlQueryString: "teststring"
            });
    })


})