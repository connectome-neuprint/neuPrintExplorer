import C from "../../../src/js/reducers/constants"
import reducer from "../../../src/js/reducers/neo4jsettings"

const state = {
    neoDriver: "existingneo4jdriver",
    neoServer: "existingneo4jserver",
    availableDatasets: ["existingdataset"],
    availableROIs: { rois: ["existingrois"] },
    user: "existinguser",
    password: "existingpassword",
    lastmod: "existinglastmod",
    version: "existingversion",
}

describe("neo4jsettings Reducer", () => {

    it("SET_NEO_DRIVER success", () => {
        const action = {
            type: C.SET_NEO_DRIVER,
            neoDriver: "newneo4jdriver"
        };
        expect(reducer(undefined, action))
            .toEqual({
                neoDriver: action.neoDriver,
                neoServer: "",
                availableDatasets: [],
                availableROIs: {},
                user: "neo4j",
                password: "neo4j",
                lastmod: "",
                version: ""
            })
        expect(reducer(state, action))
            .toEqual({
                neoDriver: action.neoDriver,
                neoServer: "existingneo4jserver",
                availableDatasets: ["existingdataset"],
                availableROIs: { rois: ["existingrois"] },
                user: "existinguser",
                password: "existingpassword",
                lastmod: "existinglastmod",
                version: "existingversion",
            });
    })

    it("SET_NEO_SERVER success", () => {
        const action = {
            type: C.SET_NEO_SERVER,
            neoServer: "newneo4jserver",
            availableDatasets: ["newdataset"],
            availableROIs: { rois: ["newrois"] },
            user: "newuser",
            password: "newpassword",
            lastmod: "newlastmod",
            version: "newversion"
        };
        expect((reducer(undefined, action)))
            .toEqual({
                neoDriver: null,
                neoServer: "newneo4jserver",
                availableDatasets: ["newdataset"],
                availableROIs: { rois: ["newrois"] },
                user: "newuser",
                password: "newpassword",
                lastmod: "newlastmod",
                version: "newversion"
            });
        expect((reducer(state, action)))
            .toEqual({
                neoDriver: "existingneo4jdriver",
                neoServer: "newneo4jserver",
                availableDatasets: ["newdataset"],
                availableROIs: { rois: ["newrois"] },
                user: "newuser",
                password: "newpassword",
                lastmod: "newlastmod",
                version: "newversion"
            });

    })
})

