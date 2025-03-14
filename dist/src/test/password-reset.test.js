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
// password-reset.test.ts
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user_model"));
// Increase the timeout if needed
jest.setTimeout(10000);
// Mock nodemailer at the very top so that it takes effect before any modules load
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ response: 'Success' }),
    }),
}));
let app;
let resetToken;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    // Clean up any existing test user
    yield user_model_1.default.deleteMany({ email: 'reset.user@example.com' });
    // Create a test user for password reset
    yield user_model_1.default.create({
        email: 'reset.user@example.com',
        password: 'SecurePassword123', // Use plain text if login compares plain text
        name: 'Reset User',
    });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.default.deleteMany({ email: 'reset.user@example.com' });
    yield mongoose_1.default.connection.close();
}));
describe('Password Reset API', () => {
    it('should request password reset', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/request-reset').send({ email: 'reset.user@example.com' });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Password reset email sent');
        // Wait a moment to ensure the reset token is written in the database
        yield new Promise((resolve) => setTimeout(resolve, 500));
        // Get the reset token from the database
        const user = yield user_model_1.default.findOne({ email: 'reset.user@example.com' });
        resetToken = user === null || user === void 0 ? void 0 : user.resetPasswordToken;
        expect(resetToken).toBeDefined();
    }));
    it('should validate the reset token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/auth/validate-reset-token/${resetToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Token is valid');
    }));
    it('should reset the password with a valid token', () => __awaiter(void 0, void 0, void 0, function* () {
        const newPassword = 'NewPassword123';
        const response = yield (0, supertest_1.default)(app).post('/auth/reset-password').send({ token: resetToken, newPassword });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Password has been reset successfully');
        // Verify that the token is removed from the user record
        const user = yield user_model_1.default.findOne({ email: 'reset.user@example.com' });
        expect(user === null || user === void 0 ? void 0 : user.resetPasswordToken).toBeUndefined();
        expect(user === null || user === void 0 ? void 0 : user.resetPasswordExpires).toBeUndefined();
    }));
    it('should be able to login with the new password', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/auth/login').send({ email: 'reset.user@example.com', password: 'NewPassword123' });
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
    }));
});
//# sourceMappingURL=password-reset.test.js.map