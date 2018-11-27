import C from "../../../src/js/reducers/constants"
import reducer from "../../../src/js/reducers/query"

const state = {
    neoQueryObj: {
        queryStr: "existingquerystring",
        callback: function () { },
        state: "existingstate",
    },
    isQuerying: false,
    neoResults: "existingneoresults",
    neoError: "existingneoerror",
}
// note: can't test equality of functions
describe("query Reducer", () => {

    it("UPDATE_QUERY success", () => {
        const action = {
            type: C.UPDATE_QUERY,
            neoQueryObj: {
                queryStr: "newquery",
                callback: "[Function callback]",
                state: {
                    datasetstr: "newdataset"
                }
            },
            isQuerying: true
        };
        expect(reducer(undefined, JSON.parse(JSON.stringify(action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "newquery",
                    callback: "[Function callback]",
                    state: {
                        datasetstr: "newdataset"
                    }
                },
                isQuerying: true,
                neoResults: null,
                neoError: null,
            });
        expect(reducer(state, JSON.parse(JSON.stringify(action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "newquery",
                    callback: "[Function callback]",
                    state: {
                        datasetstr: "newdataset"
                    }
                },
                isQuerying: true,
                neoResults: "existingneoresults",
                neoError: "existingneoerror",
            });
    })

    it("SET_QUERY_STATUS success", () => {
        const action = {
            type: C.SET_QUERY_STATUS,
            isQuerying: true
        }
        expect(JSON.parse(JSON.stringify(reducer(undefined, action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "",
                    state: null,
                },
                isQuerying: true,
                neoResults: null,
                neoError: null,
            });
        expect(JSON.parse(JSON.stringify(reducer(state, action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "existingquerystring",
                    state: "existingstate",
                },
                isQuerying: true,
                neoResults: "existingneoresults",
                neoError: "existingneoerror",
            });
    })

    it("SET_NEO_ERROR success", () => {
        const action = {
            type: C.SET_NEO_ERROR,
            neoError: "newerror"
        }
        expect(JSON.parse(JSON.stringify(reducer(undefined, action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "",
                    state: null,
                },
                isQuerying: false,
                neoResults: null,
                neoError: "newerror",
            });
        expect(JSON.parse(JSON.stringify(reducer(state, action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "existingquerystring",
                    state: "existingstate",
                },
                isQuerying: false,
                neoResults: null,
                neoError: "newerror",
            });
    })

    it("FINISH_QUERY success", () => {
        const action = {
            type: C.FINISH_QUERY
        }
        expect(JSON.parse(JSON.stringify(reducer(undefined, action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "",
                    state: null,
                },
                isQuerying: false,
                neoResults: null,
                neoError: null,
            });
        expect(JSON.parse(JSON.stringify(reducer(state, action))))
            .toEqual({
                neoQueryObj: {
                    queryStr: "existingquerystring",
                    state: "existingstate",
                },
                isQuerying: false,
                neoResults: "existingneoresults",
                neoError: null,
            });
    })
})