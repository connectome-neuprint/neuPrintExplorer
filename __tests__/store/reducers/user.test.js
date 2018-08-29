import C from "../../../src/js/reducers/constants"
import reducer from "../../../src/js/reducers/user"

const state = {
    userInfo: "existinguserinfo"
}

describe("user Reducer", () => {

    it("LOGIN_USER success", () => {
        const action = {
            type: C.LOGIN_USER,
            userInfo: "newuserinfo"
        };
        expect(reducer(undefined,action))
        .toEqual({
            userInfo: "newuserinfo"
        });
        expect(reducer(state,action))
        .toEqual({
            userInfo: "newuserinfo"
        });
    })

    it("LOGOUT_USER success", () => {
        const action = {
            type: C.LOGOUT_USER
        };
        expect(reducer(undefined,action))
        .toEqual({
            userInfo: null
        });
        expect(reducer(state,action))
        .toEqual({
            userInfo: null
        });
    })

})