const { fetchUser } = require("./index");

describe("api", () => {
    test("fetchUser returns user object", () => {
        expect(fetchUser(1)).toEqual({ id: 1, name: "User 1" });
    });

    // Intentionally failing test
    test("intentionally failing test", () => {
        expect(fetchUser(2).name).toBe("Wrong Name");
    });
});

