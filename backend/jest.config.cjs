module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(test|spec).js"],
  collectCoverageFrom: ["src/**/*.js", "!src/index.js"],
  transform: {},
  clearMocks: true,
};
