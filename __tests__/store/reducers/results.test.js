import C from "../../../src/js/reducers/constants"
import reducer from "../../../src/js/reducers/results"
import SimpleCellWrapper from "../../../src/js/helpers/SimpleCellWrapper";
import Immutable from 'immutable';

const state = {
    allTables: [
        {
            header: [
                new SimpleCellWrapper(0, "Column 1"),
                new SimpleCellWrapper(1, "Column 2"),
                new SimpleCellWrapper(2, "Column 3")
            ],
            body: [
                [
                    new SimpleCellWrapper(3, "c1 v1"),
                    new SimpleCellWrapper(4, "c2 v1"),
                    new SimpleCellWrapper(5, "c3 v1")
                ],
                [
                    new SimpleCellWrapper(3, "c1 v2"),
                    new SimpleCellWrapper(4, "c2 v2"),
                    new SimpleCellWrapper(5, "c3 v2")
                ]
            ],
            name: "Test Name",
            sortIndices: new Set([1, 2])
        }
    ]
};

describe("results Reducer", () => {

    it("UPDATE_RESULTS success", () => {
        const action = {
            type: C.UPDATE_RESULTS,
            allTables: [
                {
                    header: [
                        new SimpleCellWrapper(0, "Column 1"),
                        new SimpleCellWrapper(1, "Column 2"),
                        new SimpleCellWrapper(2, "Column 3")
                    ],
                    body: [
                        [
                            new SimpleCellWrapper(3, "c1 v1"),
                            new SimpleCellWrapper(4, "c2 v1"),
                            new SimpleCellWrapper(5, "c3 v1")
                        ],
                        [
                            new SimpleCellWrapper(3, "c1 v2"),
                            new SimpleCellWrapper(4, "c2 v2"),
                            new SimpleCellWrapper(5, "c3 v2")
                        ]
                    ],
                    name: "Test Name",
                    sortIndices: new Set([1, 2])
                }
            ]
        };
        expect(reducer(undefined, action))
            .toEqual({
                allResults: Immutable.List([]),
                allTables: [action.allTables],
                clearIndices: new Set(),
                numClear: 0
            });
        expect(reducer(state, action))
            .toEqual({
                allTables: [action.allTables],
                clearIndices: new Set(),
                numClear: 0
            });
    })

    it("APPEND_RESULTS success", () => {
        const action = {
            type: C.APPEND_RESULTS,
            allTables: [
                {
                    header: [
                        new SimpleCellWrapper(0, "Column 1"),
                        new SimpleCellWrapper(1, "Column 2"),
                        new SimpleCellWrapper(2, "Column 3")
                    ],
                    body: [
                        [
                            new SimpleCellWrapper(3, "c1 v1"),
                            new SimpleCellWrapper(4, "c2 v1"),
                            new SimpleCellWrapper(5, "c3 v1")
                        ],
                        [
                            new SimpleCellWrapper(3, "c1 v2"),
                            new SimpleCellWrapper(4, "c2 v2"),
                            new SimpleCellWrapper(5, "c3 v2")
                        ]
                    ],
                    name: "Test Name",
                    sortIndices: new Set([1, 2])
                }
            ]
        };
        expect(reducer(undefined, action))
            .toEqual({
                allResults: Immutable.List([]),
                allTables: [action.allTables],
                clearIndices: new Set(),
                numClear: 0
            });
        expect(reducer(state, action))
            .toEqual({
                allTables: [...state.allTables.slice(0, state.allTables.size), action.allTables]
            });
    })

    it("CLEAR_RESULT success", () => {
        const action = {
            type: C.CLEAR_RESULT,
            index: 0
        };
        expect(reducer(undefined, action))
            .toEqual({
                allResults: Immutable.List([]),
                allTables: null,
                clearIndices: new Set(),
                numClear: 0
            });
        expect(reducer(state, action))
            .toEqual({
                allTables: state.allTables,
                clearIndices: new Set([action.index]),
                numClear: 1
            })
    })

})
