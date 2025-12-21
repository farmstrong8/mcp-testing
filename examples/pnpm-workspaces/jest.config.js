/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "node",
    projects: ["<rootDir>/packages/*"],
    testPathIgnorePatterns: ["/node_modules/", "integration\\.test\\.ts$"],
};

