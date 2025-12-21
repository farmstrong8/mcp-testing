const { capitalize } = require("./index");

describe("utils", () => {
    test("capitalize works correctly", () => {
        expect(capitalize("hello")).toBe("Hello");
    });

    // Intentionally failing test
    test("intentionally failing test", () => {
        expect(capitalize("test")).toBe("TEST");
    });
});

