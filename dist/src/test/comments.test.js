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
const comments_model_1 = __importDefault(require("../models/comments_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
let app;
const baseUrl = '/comments';
// Test user for authentication
const testUser = {
    email: 'comments.test@example.com',
    password: 'Test1234',
    name: 'Comments Test User',
};
let accessToken;
let userId;
// Test comments data
const testComments = [
    {
        text: 'This is test comment 1',
        postId: new mongoose_1.default.Types.ObjectId().toString(),
        user: {}, // Will be populated later
    },
    {
        text: 'This is test comment 2',
        postId: new mongoose_1.default.Types.ObjectId().toString(),
        user: {}, // Will be populated later
    },
];
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Setting up comments test environment');
    app = yield (0, server_1.default)();
    // Clean up before tests
    yield user_model_1.default.deleteMany({ email: testUser.email });
    yield comments_model_1.default.deleteMany({});
    // Register test user
    const registerRes = yield (0, supertest_1.default)(app).post('/auth/register').send(testUser);
    expect(registerRes.statusCode).toBe(200);
    // Login to get authentication token
    const loginRes = yield (0, supertest_1.default)(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
    });
    expect(loginRes.statusCode).toBe(200);
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body._id;
    // Add user info to test comments
    testComments.forEach((comment) => {
        comment.user = {
            _id: userId,
            email: testUser.email,
            name: testUser.name,
        };
    });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Cleaning up comments test environment');
    yield user_model_1.default.deleteMany({ email: testUser.email });
    yield comments_model_1.default.deleteMany({});
    yield mongoose_1.default.connection.close();
}));
describe('Comments API Tests', () => {
    // Initial test to verify empty comments collection
    test('Should return empty array when no comments exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    }));
    // Test comment creation
    test('Should create new comments successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        for (const comment of testComments) {
            const response = yield (0, supertest_1.default)(app).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send(comment);
            expect(response.statusCode).toBe(201);
            expect(response.body.text).toBe(comment.text);
            expect(response.body.postId).toBe(comment.postId);
            expect(response.body.user._id).toBe(userId);
            // Store the created comment ID for later tests
            comment.user = response.body._id;
        }
    }));
    // Test retrieving all comments
    test('Should retrieve all comments', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(testComments.length);
    }));
    // Test retrieving a comment by ID
    test('Should retrieve a specific comment by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const commentId = testComments[0].user;
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}/${commentId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
        expect(response.body.text).toBe(testComments[0].text);
    }));
    // Test filtering comments by user
    test('Should filter comments by user', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}?user._id=${userId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(testComments.length);
        // All returned comments should have the current user as owner
        response.body.forEach((comment) => {
            expect(comment.user._id).toBe(userId);
        });
    }));
    // Test filtering comments by postId
    test('Should filter comments by postId', () => __awaiter(void 0, void 0, void 0, function* () {
        const postId = testComments[0].postId;
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}?postId=${postId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        expect(response.body[0].postId).toBe(postId);
    }));
    // Test deleting a comment
    test('Should delete a comment successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const commentId = testComments[0].user;
        const response = yield (0, supertest_1.default)(app).delete(`${baseUrl}/${commentId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(response.statusCode).toBe(200);
        // Verify the comment was deleted
        const checkResponse = yield (0, supertest_1.default)(app).get(`${baseUrl}/${commentId}`).set('Authorization', `Bearer ${accessToken}`);
        expect(checkResponse.statusCode).toBe(404);
    }));
    // Test comment creation with missing required fields
    test('Should reject comment creation with missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const incompleteRequests = [
            (0, supertest_1.default)(app).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({ text: 'Missing postId' }),
            (0, supertest_1.default)(app).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({ postId: new mongoose_1.default.Types.ObjectId().toString() }), // Missing text
        ];
        const responses = yield Promise.all(incompleteRequests);
        responses.forEach((response) => {
            expect(response.statusCode).toBe(400);
        });
    }));
});
//# sourceMappingURL=comments.test.js.map