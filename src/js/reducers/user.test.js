import C from "../../../src/js/reducers/constants"
import reducer from "../../../src/js/reducers/user"

const state = {
    userInfo: "existinguserinfo",
    token: "existingxyz"
}

describe("user Reducer", () => {

    it("LOGIN_USER success", () => {
        const action = {
            type: C.LOGIN_USER,
            userInfo: "newuserinfo"
        };
        expect(reducer(undefined,action))
        .toEqual({
            userInfo: "newuserinfo",
            token: ""
        });
        expect(reducer(state,action))
        .toEqual({
            userInfo: "newuserinfo",
            token: "existingxyz"
        });
    })

    it("LOGOUT_USER success", () => {
        const action = {
            type: C.LOGOUT_USER
        };
        expect(reducer(undefined,action))
        .toEqual({
            userInfo: null,
            token: ""
        });
        expect(reducer(state,action))
        .toEqual({
            userInfo: null,
            token: ""
        });
    })

})
