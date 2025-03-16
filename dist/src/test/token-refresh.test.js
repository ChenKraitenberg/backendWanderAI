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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const user_model_1 = __importDefault(require("../models/user_model"));
let app;
let accessToken;
let refreshToken;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    // Clear test user
    yield user_model_1.default.deleteMany({ email: 'refresh.test@example.com' });
    // Create test user
    const response = yield (0, supertest_1.default)(app).post('/auth/register').send({
        email: 'refresh.test@example.com',
        password: 'Test1234',
        name: 'Refresh Test User',
    });
    // Login to get tokens
    const loginResponse = yield (0, supertest_1.default)(app).post('/auth/login').send({
        email: 'refresh.test@example.com',
        password: 'Test1234',
    });
    accessToken = loginResponse.body.accessToken;
    refreshToken = loginResponse.body.refreshToken;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.default.deleteMany({ email: 'refresh.test@example.com' });
    yield mongoose_1.default.connection.close();
}));
describe('Token Refresh API', () => {
    it('should refresh tokens with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/refresh').send({ refreshToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        // Update tokens for future tests
        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    }));
    it('should reject invalid refresh tokens', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/refresh').send({ refreshToken: 'invalid-token' });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Access Denied');
    }));
    it('should logout successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/logout').send({ refreshToken });
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Logged out');
    }));
    it('should reject refresh after logout', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/refresh').send({ refreshToken });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe('Access Denied');
    }));
});
//# sourceMappingURL=token-refresh.test.js.map