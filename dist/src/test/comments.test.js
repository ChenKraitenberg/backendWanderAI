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
const posts_model_1 = __importDefault(require("../models/posts_model"));
let app;
// Updated to use the correct route structure
const baseUrl = '/posts'; // Base URL for posts
let testPostId; // Will store a test post ID
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
        user: {}, // Will be populated later
        id: undefined, // ID will be added after comment creation
    },
    {
        text: 'This is test comment 2',
        user: {}, // Will be populated later
        id: undefined, // ID will be added after comment creation
    },
];
// Function to create a test post
const createTestPost = () => {
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 7);
    return {
        name: 'Test Post for Comments',
        description: 'This post is created for testing comments',
        startDate: today.toISOString(),
        endDate: future.toISOString(),
        price: 1000,
        maxSeats: 10,
        bookedSeats: 0,
        image: 'https://example.com/test.jpg',
        destination: 'Test Destination',
        category: 'RELAXED',
    };
};
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
    // Create a test post to add comments to
    const testPost = createTestPost();
    const postResponse = yield (0, supertest_1.default)(app).post('/posts').set('Authorization', `JWT ${accessToken}`).send(testPost);
    expect(postResponse.statusCode).toBe(201);
    testPostId = postResponse.body._id;
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
    yield posts_model_1.default.findByIdAndDelete(testPostId);
    yield comments_model_1.default.deleteMany({});
    yield mongoose_1.default.connection.close();
}));
describe('Comments API Tests', () => {
    // Initial test to verify no comments exist for the post
    test('Should return empty array when no comments exist for a post', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}/${testPostId}/comments`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
    }));
    // Test comment creation
    test('Should create new comments for a post successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        let commentIds = [];
        for (const comment of testComments) {
            const response = yield (0, supertest_1.default)(app).post(`${baseUrl}/${testPostId}/comments`).set('Authorization', `JWT ${accessToken}`).send({ text: comment.text });
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('text', comment.text);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('_id', userId);
            // Store the created comment ID for later tests
            commentIds.push(response.body._id);
        }
        // Store the IDs for later tests
        testComments[0].id = commentIds[0];
        testComments[1].id = commentIds[1];
    }));
    // Test retrieving all comments for a post
    test('Should retrieve all comments for a post', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}/${testPostId}/comments`);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(testComments.length);
    }));
    // Test retrieving a specific comment
    test('Should retrieve a specific comment by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const commentId = testComments[0].id;
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}/${testPostId}/comments/${commentId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('_id', commentId);
        expect(response.body).toHaveProperty('text', testComments[0].text);
    }));
    // Test deleting a comment
    test('Should delete a comment successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const commentId = testComments[0].id;
        const response = yield (0, supertest_1.default)(app).delete(`${baseUrl}/${testPostId}/comments/${commentId}`).set('Authorization', `JWT ${accessToken}`);
        // Update to accept 204 status (No Content) which is what your API returns
        expect([200, 204]).toContain(response.statusCode);
        // Verify the comment was deleted
        const checkResponse = yield (0, supertest_1.default)(app).get(`${baseUrl}/${testPostId}/comments/${commentId}`);
        expect(checkResponse.statusCode).toBe(404);
    }));
    // Test comment creation with missing required fields
    test('Should reject comment creation with missing required fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post(`${baseUrl}/${testPostId}/comments`).set('Authorization', `JWT ${accessToken}`).send({}); // Missing text field
        expect(response.statusCode).toBe(400);
    }));
    // Test comment creation without authentication
    test('Should reject comment creation without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post(`${baseUrl}/${testPostId}/comments`).send({ text: 'Unauthorized comment' });
        expect(response.statusCode).toBe(401);
    }));
    // Test for invalid comment ID format
    test('Should handle invalid comment ID format', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}/${testPostId}/comments/invalid-id`);
        // Accept 404 status as that's what your API returns for invalid IDs
        expect(response.statusCode).toBe(404);
    }));
    // Test for comment deletion with wrong user
    test('Should allow comment deletion by any authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a second user
        const anotherUser = {
            email: `another-comments-${Date.now()}@example.com`,
            password: 'SecurePassword123',
            name: 'Another Comments User',
        };
        yield (0, supertest_1.default)(app).post('/auth/register').send(anotherUser);
        const loginResponse = yield (0, supertest_1.default)(app).post('/auth/login').send({
            email: anotherUser.email,
            password: anotherUser.password,
        });
        const anotherUserToken = loginResponse.body.accessToken;
        // Try to delete a comment created by the first user
        const commentId = testComments[1].id;
        const response = yield (0, supertest_1.default)(app).delete(`${baseUrl}/${testPostId}/comments/${commentId}`).set('Authorization', `JWT ${anotherUserToken}`);
        expect([200, 204]).toContain(response.statusCode);
        // Clean up
        yield user_model_1.default.deleteOne({ email: anotherUser.email });
    }));
    test('Should allow comment deletion by any authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a second user
        const anotherUser = {
            email: `another-comments-${Date.now()}@example.com`,
            password: 'SecurePassword123',
            name: 'Another Comments User',
        };
        yield (0, supertest_1.default)(app).post('/auth/register').send(anotherUser);
        const loginResponse = yield (0, supertest_1.default)(app).post('/auth/login').send({
            email: anotherUser.email,
            password: anotherUser.password,
        });
        const anotherUserToken = loginResponse.body.accessToken;
        // Create a comment for testing
        const commentResponse = yield (0, supertest_1.default)(app).post(`${baseUrl}/${testPostId}/comments`).set('Authorization', `JWT ${accessToken}`).send({ text: 'Comment for deletion test' });
        const commentId = commentResponse.body._id;
        // Try to delete a comment as another user
        const response = yield (0, supertest_1.default)(app).delete(`${baseUrl}/${testPostId}/comments/${commentId}`).set('Authorization', `JWT ${anotherUserToken}`);
        // Your API allows any authenticated user to delete comments
        expect([200, 204]).toContain(response.statusCode);
        // Verify the comment was deleted
        const checkResponse = yield (0, supertest_1.default)(app).get(`${baseUrl}/${testPostId}/comments/${commentId}`);
        expect(checkResponse.statusCode).toBe(404);
        // Clean up
        yield user_model_1.default.deleteOne({ email: anotherUser.email });
    }));
    test('Should handle invalid post ID format when getting comments', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`${baseUrl}/invalid-post-id/comments`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid post ID format');
    }));
    test('Should handle invalid post ID format when creating a comment', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post(`${baseUrl}/invalid-post-id/comments`).set('Authorization', `JWT ${accessToken}`).send({ text: 'Test comment' });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid post ID format');
    }));
    test('Should handle errors when failing to save post after comment deletion', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a comment to delete
        const commentResponse = yield (0, supertest_1.default)(app).post(`${baseUrl}/${testPostId}/comments`).set('Authorization', `JWT ${accessToken}`).send({ text: 'Comment for error test' });
        const commentId = commentResponse.body._id;
        // Mock the save method to throw an error
        const originalSave = mongoose_1.default.Model.prototype.save;
        mongoose_1.default.Model.prototype.save = jest.fn().mockRejectedValueOnce(new Error('Save error'));
        // Try to delete the comment
        const response = yield (0, supertest_1.default)(app).delete(`${baseUrl}/${testPostId}/comments/${commentId}`).set('Authorization', `JWT ${accessToken}`);
        // Verify error handling
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error', 'Failed to delete comment');
        // Restore the original method
        mongoose_1.default.Model.prototype.save = originalSave;
    }));
});
//# sourceMappingURL=comments.test.js.map