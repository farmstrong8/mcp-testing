const { greet } = require("./index");

describe("core", () => {
    test("greet returns greeting", () => {
        expect(greet("World")).toBe("Hello, World!");
    });
});

