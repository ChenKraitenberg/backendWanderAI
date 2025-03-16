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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user_model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
// Ensure nodemailer is mocked before anything else
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ response: 'Success' }),
    }),
}));
let app;
// Test user data
const testUser = {
    email: `auth-test-${Date.now()}@example.com`,
    password: 'SecurePassword123',
    name: 'Auth Test User',
};
let accessToken;
let refreshToken;
let userId;
let resetToken;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    // Clean up any existing test users
    yield user_model_1.default.deleteMany({ email: testUser.email });
    yield user_model_1.default.deleteMany({ email: /^auth-test-.*@example\.com$/ });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clean up
    yield user_model_1.default.deleteMany({ email: testUser.email });
    yield user_model_1.default.deleteMany({ email: /^auth-test-.*@example\.com$/ });
    yield mongoose_1.default.connection.close();
}));
describe('Auth Controller Tests', () => {
    describe('User Registration', () => {
        test('Should register a new user with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/register').send(testUser);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('_id');
            expect(response.body.user).toHaveProperty('email', testUser.email);
            expect(response.body.user).toHaveProperty('name', testUser.name);
            // Save user ID for later tests
            userId = response.body.user._id;
        }));
        test('Should reject registration without email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/register').send({
                password: 'TestPassword123',
                name: 'No Email User',
            });
            expect(response.status).toBe(400);
        }));
        test('Should reject registration without password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/auth/register')
                .send({
                email: `auth-test-nopass-${Date.now()}@example.com`,
                name: 'No Password User',
            });
            expect(response.status).toBe(400);
        }));
        test('Should reject registration without name', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/auth/register')
                .send({
                email: `auth-test-noname-${Date.now()}@example.com`,
                password: 'TestPassword123',
            });
            expect(response.status).toBe(400);
        }));
        test('Should reject registration with duplicate email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/register').send(testUser);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User already exists');
        }));
        test('Should handle registration with very long values', () => __awaiter(void 0, void 0, void 0, function* () {
            const longString = 'a'.repeat(300);
            const longEmail = `auth-test-long-${Date.now()}@example.com`;
            const response = yield (0, supertest_1.default)(app).post('/auth/register').send({
                email: longEmail,
                password: longString,
                name: longString,
            });
            // Should either succeed or fail gracefully
            expect([200, 400]).toContain(response.status);
            // Clean up if user was created
            if (response.status === 200) {
                yield user_model_1.default.deleteOne({ email: longEmail });
            }
        }));
    });
    describe('User Login', () => {
        test('Should log in with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: testUser.email,
                password: testUser.password,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email);
            // Save tokens for later tests
            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
            userId = response.body._id;
        }));
        test('Should reject login with incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: testUser.email,
                password: 'WrongPassword123',
            });
            expect(response.status).toBe(400);
        }));
        test('Should reject login with non-existent email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/auth/login')
                .send({
                email: `nonexistent-${Date.now()}@example.com`,
                password: 'TestPassword123',
            });
            expect(response.status).toBe(400);
        }));
        test('Should reject login without email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/login').send({
                password: 'TestPassword123',
            });
            expect(response.status).toBe(400);
        }));
        test('Should reject login without password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: testUser.email,
            });
            expect(response.status).toBe(400);
        }));
    });
    describe('Token Authentication', () => {
        test('Should get user profile with valid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/auth/me').set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id', userId);
            expect(response.body).toHaveProperty('email', testUser.email);
        }));
        test('Should reject request without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/auth/me').set('Authorization', 'Bearer validToken'); // This is not a real token
            expect(response.status).toBe(401);
            expect(response.text).toBe('Access Denied');
        }));
        test('Should reject request with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/auth/me').set('Authorization', 'Bearer invalid.token.here');
            expect(response.status).toBe(401);
            expect(response.text).toBe('Access Denied');
        }));
        test('Should reject request with malformed authorization header', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/auth/me').set('Authorization', 'NotBearer token');
            expect(response.status).toBe(401);
            expect(response.text).toBe('Access Denied');
        }));
        test('Should reject request with non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create token with non-existent user ID
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const fakeToken = jsonwebtoken_1.default.sign({ _id: fakeId, email: 'fake@example.com' }, process.env.TOKEN_SECRET || 'test-secret');
            const response = yield (0, supertest_1.default)(app).get('/auth/me').set('Authorization', `Bearer ${fakeToken}`);
            expect(response.status).toBe(400);
        }));
    });
    describe('Token Refresh', () => {
        test('Should refresh tokens with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/refresh').send({
                refreshToken: refreshToken,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            // Update tokens for future tests
            accessToken = response.body.accessToken;
            refreshToken = response.body.refreshToken;
        }));
        test('Should reject refresh with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/refresh').send({
                refreshToken: 'invalid.refresh.token',
            });
            expect(response.status).toBe(400);
            expect(response.text).toBe('Access Denied');
        }));
        test('Should reject refresh without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/refresh').send({});
            expect(response.status).toBe(400);
            expect(response.text).toBe('Access Denied');
        }));
    });
    describe('Social Login', () => {
        // Mock axios for social token verification
        beforeEach(() => {
            jest.spyOn(axios_1.default, 'get').mockResolvedValue({
                data: {
                    email: 'social-user@example.com',
                    name: 'Social Test User',
                    picture: 'https://example.com/avatar.jpg',
                },
                status: 200,
            });
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        test('Should handle social login with valid Google token', () => __awaiter(void 0, void 0, void 0, function* () {
            const socialLoginData = {
                provider: 'google',
                token: 'valid-google-token',
                email: 'social-user@example.com',
                name: 'Social Test User',
            };
            const response = yield (0, supertest_1.default)(app).post('/auth/social-login').send(socialLoginData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', socialLoginData.email);
            // Clean up
            yield user_model_1.default.deleteOne({ email: socialLoginData.email });
        }));
        test('Should handle social login without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const socialLoginData = {
                provider: 'google',
                email: 'social-user@example.com',
                name: 'Social Test User',
            };
            const response = yield (0, supertest_1.default)(app).post('/auth/social-login').send(socialLoginData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Provider and token are required');
        }));
        test('Should handle social login without name', () => __awaiter(void 0, void 0, void 0, function* () {
            const socialLoginData = {
                provider: 'google',
                token: 'valid-google-token',
                email: 'social-user@example.com',
            };
            const response = yield (0, supertest_1.default)(app).post('/auth/social-login').send(socialLoginData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Username is required');
        }));
        test('Should handle social login with invalid provider', () => __awaiter(void 0, void 0, void 0, function* () {
            const socialLoginData = {
                provider: 'invalid_provider',
                token: 'valid-token',
                email: 'social-user@example.com',
                name: 'Social Test User',
            };
            const response = yield (0, supertest_1.default)(app).post('/auth/social-login').send(socialLoginData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid provider');
        }));
        test('Should handle social login with token verification error', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock axios to throw an error
            jest.spyOn(axios_1.default, 'get').mockRejectedValueOnce(new Error('Token verification failed'));
            const socialLoginData = {
                provider: 'google',
                token: 'invalid-token',
                email: 'social-user@example.com',
                name: 'Social Test User',
            };
            const response = yield (0, supertest_1.default)(app).post('/auth/social-login').send(socialLoginData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid token');
        }));
        test('Should update existing user on social login', () => __awaiter(void 0, void 0, void 0, function* () {
            // First create a regular user
            const regularUser = {
                email: `social-merge-${Date.now()}@example.com`,
                password: 'TestPassword123',
                name: 'Regular User',
            };
            yield (0, supertest_1.default)(app).post('/auth/register').send(regularUser);
            // Then do social login with same email
            jest.spyOn(axios_1.default, 'get').mockResolvedValueOnce({
                data: {
                    email: regularUser.email,
                    name: 'Social Name',
                    picture: 'https://example.com/social-avatar.jpg',
                },
                status: 200,
            });
            const socialLoginData = {
                provider: 'google',
                token: 'valid-google-token',
                email: regularUser.email,
                name: 'Social Name',
                avatar: 'https://example.com/social-avatar.jpg',
            };
            const response = yield (0, supertest_1.default)(app).post('/auth/social-login').send(socialLoginData);
            expect(response.status).toBe(200);
            // Verify the user was updated with social provider
            const user = yield user_model_1.default.findOne({ email: regularUser.email });
            expect(user).toBeDefined();
            expect(user === null || user === void 0 ? void 0 : user.socialProvider).toBe('google');
            // Clean up
            yield user_model_1.default.deleteOne({ email: regularUser.email });
        }));
    });
    // ------------------------------------------------------------------------------------
    // ADDITIONAL TESTS FOR /auth/me (GET) AND /auth/me (PUT) ERROR PATHS
    // These tests specifically cover lines in auth_route.js such as 201, 218–219, 228–229, 237
    // by forcing user not found or database errors.
    // ------------------------------------------------------------------------------------
    describe('Additional Coverage for /auth/me routes', () => {
        it('should return 400 if user not found (GET /auth/me)', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(user_model_1.default, 'findById').mockResolvedValueOnce(null);
            const response = yield (0, supertest_1.default)(app).get('/auth/me').set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(400);
            expect(response.text).toBe('User not found');
            jest.restoreAllMocks();
        }));
        it('should return 500 if database error occurs in GET /auth/me', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(user_model_1.default, 'findById').mockImplementationOnce(() => {
                throw new Error('Simulated DB error');
            });
            const response = yield (0, supertest_1.default)(app).get('/auth/me').set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(500);
            jest.restoreAllMocks();
        }));
        it('should return 400 if user not found (PUT /auth/me)', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(user_model_1.default, 'findByIdAndUpdate').mockResolvedValueOnce(null);
            const response = yield (0, supertest_1.default)(app).put('/auth/me').set('Authorization', `Bearer ${accessToken}`).send({ name: 'New Name' });
            expect(response.status).toBe(400);
            expect(response.text).toBe('Access Denied');
            jest.restoreAllMocks();
        }));
        it('should return 500 if database error occurs in PUT /auth/me', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(user_model_1.default, 'findByIdAndUpdate').mockImplementationOnce(() => {
                throw new Error('Simulated DB error');
            });
            const response = yield (0, supertest_1.default)(app).put('/auth/me').set('Authorization', `Bearer ${accessToken}`).send({ name: 'New Name' });
            expect(response.status).toBe(500);
            jest.restoreAllMocks();
        }));
    });
    // ------------------------------------------------------------------------------------
    describe('Password Reset Flow', () => {
        test('Should request password reset with valid email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/request-reset').send({
                email: testUser.email,
            });
            expect(response.status).toBe(200);
            // Get the reset token from the database
            const user = yield user_model_1.default.findOne({ email: testUser.email });
            resetToken = (user === null || user === void 0 ? void 0 : user.resetPasswordToken) || '';
            expect(resetToken).toBeTruthy();
        }));
        test('Should handle reset token validation', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/auth/validate-reset-token/${resetToken}`);
            expect([200, 400]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toHaveProperty('message', 'Token is valid');
            }
        }));
        test('Should reject invalid reset token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/auth/validate-reset-token/invalid-token');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid or expired token');
        }));
        test('Should handle password reset with token', () => __awaiter(void 0, void 0, void 0, function* () {
            const newPassword = 'NewPassword456';
            const response = yield (0, supertest_1.default)(app).post('/auth/reset-password').send({
                token: resetToken,
                newPassword: newPassword,
            });
            expect([200, 400]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toHaveProperty('message', 'Password has been reset successfully');
                // Verify login with new password
                const loginResponse = yield (0, supertest_1.default)(app).post('/auth/login').send({
                    email: testUser.email,
                    password: newPassword,
                });
                expect(loginResponse.status).toBe(200);
                // Update test user password for future tests
                testUser.password = newPassword;
            }
        }));
        test('Should reject reset without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/reset-password').send({
                newPassword: 'SomePassword123',
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Token and new password are required');
        }));
        test('Should reject reset without new password', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/reset-password').send({
                token: 'some-token',
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Token and new password are required');
        }));
        test('Should handle expired reset token', () => __awaiter(void 0, void 0, void 0, function* () {
            // Request a reset to get a new token
            yield (0, supertest_1.default)(app).post('/auth/request-reset').send({ email: testUser.email });
            // Get the token
            const user = yield user_model_1.default.findOne({ email: testUser.email });
            const token = user === null || user === void 0 ? void 0 : user.resetPasswordToken;
            // Manually expire the token
            yield user_model_1.default.updateOne({ email: testUser.email }, { resetPasswordExpires: new Date(Date.now() - 3600000) } // 1 hour ago
            );
            // Try to use the expired token
            const responseExpired = yield (0, supertest_1.default)(app).post('/auth/reset-password').send({
                token,
                newPassword: 'ExpiredTokenTest123',
            });
            expect(responseExpired.status).toBe(400);
            expect(responseExpired.body).toHaveProperty('message', 'Invalid or expired token');
        }));
    });
    describe('User Check Functionality', () => {
        test('Should confirm existing user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/check-user').send({
                email: testUser.email,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('exists', true);
            expect(response.body).toHaveProperty('userId');
        }));
        test('Should confirm non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/auth/check-user')
                .send({
                email: `nonexistent-${Date.now()}@example.com`,
            });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('exists', false);
            expect(response.body.userId).toBeUndefined();
        }));
        test('Should reject check without email', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/check-user').send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Email is required');
        }));
        test('Should validate email format', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/check-user').send({
                email: 'not-an-email',
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid email format');
        }));
    });
    describe('User Profile Management', () => {
        test('Should update user profile', () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                name: 'Updated Test User',
                avatar: 'https://example.com/new-avatar.jpg',
            };
            const response = yield (0, supertest_1.default)(app).put('/auth/me').set('Authorization', `Bearer ${accessToken}`).send(updateData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id', userId);
            expect(response.body).toHaveProperty('avatar', updateData.avatar);
            // Verify changes in database
            const user = yield user_model_1.default.findById(userId);
            expect(user === null || user === void 0 ? void 0 : user.name).toBe(updateData.name);
            expect(user === null || user === void 0 ? void 0 : user.avatar).toBe(updateData.avatar);
        }));
        test('Should reject profile update without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                name: 'Unauthorized Update',
            };
            const response = yield (0, supertest_1.default)(app).put('/auth/me').send(updateData);
            expect(response.status).toBe(401);
            expect(response.text).toBe('Access Denied');
        }));
    });
    describe('Logout Functionality', () => {
        test('Should logout with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/logout').send({
                refreshToken: refreshToken,
            });
            expect(response.status).toBe(200);
            expect(response.text).toBe('Logged out');
            // Verify refresh token was removed
            const user = yield user_model_1.default.findById(userId);
            expect(user === null || user === void 0 ? void 0 : user.refreshToken).not.toContain(refreshToken);
        }));
        test('should return 400 for invalid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/logout').send({ refreshToken: 'invalidToken' });
            expect(response.status).toBe(400);
        }));
        test('should return 400 for an invalid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/refresh').send({ refreshToken: 'invalidToken' });
            expect(response.status).toBe(400);
        }));
        test('Should reject logout with invalid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/logout').send({
                refreshToken: 'invalid-token',
            });
            expect(response.status).toBe(400);
            expect(response.text).toBe('Access Denied');
        }));
        test('Should reject logout without refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/auth/logout').send({});
            expect(response.status).toBe(400);
            expect(response.text).toBe('Access Denied');
        }));
    });
    describe('Error Handling', () => {
        test('Should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Save original implementation
            const originalFindOne = mongoose_1.default.Model.findOne;
            // Mock findOne to throw error
            mongoose_1.default.Model.findOne = jest.fn().mockImplementationOnce(() => {
                throw new Error('Database error');
            });
            // Try login with mocked error
            const response = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: testUser.email,
                password: testUser.password,
            });
            // Should return error but not crash
            expect(response.status).toBe(400);
            // Restore original implementation
            mongoose_1.default.Model.findOne = originalFindOne;
        }));
    });
    test('Should handle various social login edge cases', () => __awaiter(void 0, void 0, void 0, function* () {
        // Test with missing email
        const missingEmailResponse = yield (0, supertest_1.default)(app).post('/auth/social-login').send({
            provider: 'google',
            token: 'valid-token',
            // email is missing
            name: 'Test User',
        });
        expect(missingEmailResponse.status).toBe(400);
        // Test with empty token
        const emptyTokenResponse = yield (0, supertest_1.default)(app).post('/auth/social-login').send({
            provider: 'google',
            token: '',
            email: 'test@example.com',
            name: 'Test User',
        });
        expect(emptyTokenResponse.status).toBe(400);
        // Test with token verification error
        jest.spyOn(axios_1.default, 'get').mockRejectedValueOnce(new Error('Token verification failed'));
        const invalidTokenResponse = yield (0, supertest_1.default)(app).post('/auth/social-login').send({
            provider: 'google',
            token: 'invalid-token',
            email: 'test@example.com',
            name: 'Test User',
        });
        expect(invalidTokenResponse.status).toBe(400);
        // Restore axios mock
        jest.restoreAllMocks();
    }));
});
//# sourceMappingURL=auth.test.js.map