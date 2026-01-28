describe("math", () => {
    test("intentional failure - wrong addition", () => {
        expect(1 + 1).toBe(3);
    });

    test("intentional failure - wrong subtraction", () => {
        expect(5 - 3).toBe(10);
    });
});
