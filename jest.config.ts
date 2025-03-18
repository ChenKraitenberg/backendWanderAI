// /** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// export default {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   roots: ['<rootDir>/src', '<rootDir>'],
//   setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
//   coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
// };

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  globalTeardown: '<rootDir>/dist/src/test/globalTeardown.js',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
};
