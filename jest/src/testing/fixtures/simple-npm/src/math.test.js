const { add, subtract } = require("./math");

describe("math", () => {
    test("add returns sum of two numbers", () => {
        expect(add(2, 3)).toBe(5);
    });

    test("subtract returns difference of two numbers", () => {
        expect(subtract(5, 3)).toBe(2);
    });

    // Intentionally failing test for integration testing
    test("intentionally failing test", () => {
        expect(add(1, 1)).toBe(3);
    });
});
