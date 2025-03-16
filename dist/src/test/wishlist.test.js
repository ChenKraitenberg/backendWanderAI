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
const wishlist_model_1 = __importDefault(require("../models/wishlist_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
let app;
let accessToken;
let userId;
let testWishlistItemId;
// Test user data
const testUser = {
    email: `wishlist-test-${Date.now()}@example.com`,
    password: 'SecurePassword123',
    name: 'Wishlist Test User',
};
// Test wishlist item
const testWishlistItem = {
    title: 'Dream Trip to Paris',
    description: 'Exploring the city of lights',
    destination: 'Paris, France',
    duration: '7 days',
    category: 'RELAXED',
    itinerary: ['Day 1: Eiffel Tower', 'Day 2: Louvre Museum'],
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    // Clean up any existing test data
    yield user_model_1.default.deleteMany({ email: testUser.email });
    // Create test user
    const registerResponse = yield (0, supertest_1.default)(app).post('/auth/register').send(testUser);
    // Login to get authentication token
    const loginResponse = yield (0, supertest_1.default)(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
    });
    accessToken = loginResponse.body.accessToken;
    userId = loginResponse.body._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clean up test data
    yield wishlist_model_1.default.deleteMany({ userId });
    yield user_model_1.default.deleteMany({ email: testUser.email });
    yield mongoose_1.default.connection.close();
}));
describe('Wishlist Controller Tests', () => {
    describe('Wishlist Creation', () => {
        test('Should create wishlist item with valid data', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(testWishlistItem);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('title', testWishlistItem.title);
            expect(response.body).toHaveProperty('userId', userId);
            // Save ID for later tests
            testWishlistItemId = response.body._id;
        }));
        test('Should reject creation without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post('/wishlist').send(testWishlistItem);
            expect(response.status).toBe(401);
            // expect(response.body).toHaveProperty('error', 'User ID not found in request');
        }));
        test('Should reject creation with missing title', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidItem = Object.assign(Object.assign({}, testWishlistItem), { title: undefined });
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing required field: title');
        }));
        test('Should reject creation with missing description', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidItem = Object.assign(Object.assign({}, testWishlistItem), { description: undefined });
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing required field: description');
        }));
        test('Should reject creation with missing destination', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidItem = Object.assign(Object.assign({}, testWishlistItem), { destination: undefined });
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing required field: destination');
        }));
        test('Should reject creation with missing duration', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidItem = Object.assign(Object.assign({}, testWishlistItem), { duration: undefined });
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing required field: duration');
        }));
        test('Should reject creation with missing category', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidItem = Object.assign(Object.assign({}, testWishlistItem), { category: undefined });
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Missing required field: category');
        }));
        test('Should create wishlist item with minimal required fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const minimalItem = {
                title: 'Minimal Wishlist Item',
                description: 'Testing minimal fields',
                destination: 'Anywhere',
                duration: '3 days',
                category: 'RELAXED',
            };
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(minimalItem);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('title', minimalItem.title);
            // Clean up
            yield wishlist_model_1.default.findByIdAndDelete(response.body._id);
        }));
        test('Should handle extremely long values', () => __awaiter(void 0, void 0, void 0, function* () {
            const longString = 'a'.repeat(1000);
            const longItem = {
                title: longString,
                description: longString,
                destination: longString,
                duration: longString,
                category: 'RELAXED',
            };
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(longItem);
            // Should either succeed or fail gracefully, not crash
            expect([201, 400, 500]).toContain(response.status);
            // Clean up if created
            if (response.status === 201) {
                yield wishlist_model_1.default.findByIdAndDelete(response.body._id);
            }
        }));
        test('Should handle special characters in input', () => __awaiter(void 0, void 0, void 0, function* () {
            const specialItem = {
                title: 'Item with <script>alert("XSS")</script>',
                description: 'Description with special chars: !@#$%^&*()',
                destination: 'Destination with quotes "test" and \'test\'',
                duration: '7 days',
                category: 'RELAXED',
            };
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(specialItem);
            // Should either succeed or fail gracefully, not crash
            expect([201, 400, 500]).toContain(response.status);
            // Clean up if created
            if (response.status === 201) {
                yield wishlist_model_1.default.findByIdAndDelete(response.body._id);
            }
        }));
    });
    describe('Wishlist Retrieval', () => {
        test('Should get all wishlist items for authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            // Should contain at least the item we created
            expect(response.body.length).toBeGreaterThan(0);
            // Find our test item in the response
            const found = response.body.some((item) => item._id === testWishlistItemId);
            expect(found).toBeTruthy();
        }));
        test('Should reject retrieval without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/wishlist');
            expect(response.status).toBe(401);
            console.log(response.body);
        }));
        test('Should handle empty wishlist', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a new user with empty wishlist
            const emptyUser = {
                email: `empty-wishlist-${Date.now()}@example.com`,
                password: 'SecurePassword123',
                name: 'Empty Wishlist User',
            };
            yield (0, supertest_1.default)(app).post('/auth/register').send(emptyUser);
            const loginResponse = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: emptyUser.email,
                password: emptyUser.password,
            });
            const emptyUserToken = loginResponse.body.accessToken;
            const response = yield (0, supertest_1.default)(app).get('/wishlist').set('Authorization', `Bearer ${emptyUserToken}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body.length).toBe(0);
            // Clean up
            yield user_model_1.default.deleteOne({ email: emptyUser.email });
        }));
        test('Should handle invalid authorization token format', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get('/wishlist').set('Authorization', 'InvalidToken');
            expect(response.status).toBe(401);
        }));
    });
    describe('Wishlist Deletion', () => {
        test('Should delete wishlist item by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            // First create an item to delete
            const newItem = {
                title: 'Item to Delete',
                description: 'This item will be deleted',
                destination: 'Nowhere',
                duration: '5 days',
                category: 'RELAXED',
            };
            const createResponse = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(newItem);
            const itemId = createResponse.body._id;
            // Now delete it
            const deleteResponse = yield (0, supertest_1.default)(app).delete(`/wishlist/${itemId}`).set('Authorization', `Bearer ${accessToken}`);
            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toHaveProperty('message', 'Item removed from wishlist');
            // Verify it's gone
            const getResponse = yield (0, supertest_1.default)(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);
            const stillExists = getResponse.body.some((item) => item._id === itemId);
            expect(stillExists).toBeFalsy();
        }));
        test('Should reject deletion without authentication', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).delete(`/wishlist/${testWishlistItemId}`);
            expect(response.status).toBe(401);
            console.log(response.body);
        }));
        test('Should reject deletion of non-existent item', () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeId = new mongoose_1.default.Types.ObjectId().toString();
            const response = yield (0, supertest_1.default)(app).delete(`/wishlist/${fakeId}`).set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Wishlist item not found');
        }));
        test('Should reject deletion with invalid ID format', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).delete('/wishlist/invalid-id-format').set('Authorization', `Bearer ${accessToken}`);
            // Should handle invalid ID gracefully
            expect([400, 404, 500]).toContain(response.status);
        }));
        test("Should not allow deleting another user's wishlist item", () => __awaiter(void 0, void 0, void 0, function* () {
            // Create another user
            const anotherUser = {
                email: `another-wishlist-${Date.now()}@example.com`,
                password: 'SecurePassword123',
                name: 'Another Wishlist User',
            };
            yield (0, supertest_1.default)(app).post('/auth/register').send(anotherUser);
            const loginResponse = yield (0, supertest_1.default)(app).post('/auth/login').send({
                email: anotherUser.email,
                password: anotherUser.password,
            });
            const anotherUserToken = loginResponse.body.accessToken;
            // Try to delete the first user's item
            const response = yield (0, supertest_1.default)(app).delete(`/wishlist/${testWishlistItemId}`).set('Authorization', `Bearer ${anotherUserToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Wishlist item not found');
            // Clean up
            yield user_model_1.default.deleteOne({ email: anotherUser.email });
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
            // Try to delete with mocked error
            const response = yield (0, supertest_1.default)(app).delete(`/wishlist/${testWishlistItemId}`).set('Authorization', `Bearer ${accessToken}`);
            // Should return error but not crash
            expect([400, 500]).toContain(response.status);
            // Restore original implementation
            mongoose_1.default.Model.findOne = originalFindOne;
        }));
        test('Should handle token extraction errors', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create invalid token
            const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkludmFsaWQgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.invalid-signature';
            const response = yield (0, supertest_1.default)(app).get('/wishlist').set('Authorization', `Bearer ${invalidToken}`);
            expect(response.status).toBe(401);
        }));
        test('Should handle invalid category values gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCategoryItem = {
                title: 'Invalid Category Test',
                description: 'Testing invalid category',
                destination: 'Test Destination',
                duration: '7 days',
                category: 'INVALID_CATEGORY', // Invalid category
            };
            const response = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidCategoryItem);
            // Should handle gracefully (either accept it or return a proper error)
            expect([201, 400, 500]).toContain(response.status);
            // Clean up if created
            if (response.status === 201) {
                yield wishlist_model_1.default.findByIdAndDelete(response.body._id);
            }
        }));
    });
    // Tests for getUserId functionality
    describe('User ID Extraction', () => {
        test('Should extract userId from auth token', () => __awaiter(void 0, void 0, void 0, function* () {
            // This is implicitly tested by the successful creation and retrieval tests
            // but we can add an explicit test if needed
            const response = yield (0, supertest_1.default)(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
        }));
        test('Should extract userId from query parameters', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a valid token but use query param instead
            const response = yield (0, supertest_1.default)(app).get(`/wishlist?userId=${userId}`).set('Authorization', `Bearer ${accessToken}`);
            expect(response.status).toBe(200);
        }));
    });
    test('Should handle wishlist edge cases', () => __awaiter(void 0, void 0, void 0, function* () {
        // Test with empty fields
        const emptyFieldsItem = {
            title: 'Empty Fields Test',
            description: '',
            destination: '',
            duration: '',
            category: 'RELAXED',
        };
        const emptyFieldsResponse = yield (0, supertest_1.default)(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(emptyFieldsItem);
        // Should either accept or reject with proper error
        expect([201, 400, 500]).toContain(emptyFieldsResponse.status);
        // Test with invalid ObjectId
        const invalidIdResponse = yield (0, supertest_1.default)(app).get('/wishlist/not-a-valid-id').set('Authorization', `Bearer ${accessToken}`);
        expect([400, 404]).toContain(invalidIdResponse.status);
        // Test database error handling
        const originalFind = mongoose_1.default.Model.find;
        mongoose_1.default.Model.find = jest.fn().mockImplementationOnce(() => {
            throw new Error('Mock database error');
        });
        const errorResponse = yield (0, supertest_1.default)(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);
        // Should handle error gracefully
        expect([400, 500]).toContain(errorResponse.status);
        // Restore original method
        mongoose_1.default.Model.find = originalFind;
    }));
});
//# sourceMappingURL=wishlist.test.js.map