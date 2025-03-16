"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
exports.default = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>'],
    setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
};
//# sourceMappingURL=jest.config.js.map