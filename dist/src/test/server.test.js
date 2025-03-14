"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../server"));
const supertest_1 = __importDefault(require("supertest"));
describe('Server Initialization Tests', () => {
    let app;
    const originalEnv = process.env;
    beforeEach(() => {
        // Store original environment and restore between tests
        jest.resetModules();
        process.env = Object.assign({}, originalEnv);
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
    }));
    it('should initialize the server correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.default)();
        expect(app).toBeDefined();
        // Test that routes are working
        const response = yield (0, supertest_1.default)(app).get('/about');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World!');
    }));
    it('should handle missing database connection string', () => __awaiter(void 0, void 0, void 0, function* () {
        process.env.DB_CONNECTION = undefined;
        yield expect((0, server_1.default)()).rejects.toMatch('DB_CONNECTION is not defined');
    }));
    it('should have CORS configured correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        app = yield (0, server_1.default)();
        const response = yield (0, supertest_1.default)(app).options('/posts').set('Origin', 'http://localhost:5173');
        expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
        expect(response.headers['access-control-allow-methods']).toBeTruthy();
    }));
});
//# sourceMappingURL=server.test.js.map