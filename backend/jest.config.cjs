/**
 * @file jest.config.cjs
 * @description Configuración de Jest para los tests del backend.
 * Define el entorno, la ubicación de los tests, la cobertura y deshabilita
 * la transformación de módulos para usar ESM nativo.
 */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(test|spec).js"],
  collectCoverageFrom: ["src/**/*.js", "!src/index.js"],
  transform: {},
  clearMocks: true,
};