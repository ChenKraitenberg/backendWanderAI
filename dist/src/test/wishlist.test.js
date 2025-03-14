"use strict";
// import request from 'supertest';
// import appInit from '../server';
// import mongoose from 'mongoose';
// import wishlistModel from '../models/wishlist_model';
// import userModel from '../models/user_model';
// import { Express } from 'express';
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
// let app: Express;
// let testUserId: string;
// let authToken: string;
// // Sample wishlist item for testing
// const testWishlistItem = {
//   title: 'Dream Trip to Paris',
//   description: 'Exploring the city of lights',
//   destination: 'Paris, France',
//   duration: '7 days',
//   category: 'RELAXED',
//   itinerary: ['Day 1: Eiffel Tower', 'Day 2: Louvre Museum'],
// };
// beforeAll(async () => {
//   console.log('Setting up wishlist tests');
//   app = await appInit();
//   // Clear relevant collections
//   await wishlistModel.deleteMany({});
//   // Create a test user for authentication
//   const testUser = {
//     email: 'wishlist-test@example.com',
//     password: 'password123',
//     name: 'Wishlist Tester',
//   };
//   try {
//     // Try to delete existing user if it exists
//     await userModel.deleteMany({ email: testUser.email });
//     // Register the test user
//     const registerResponse = await request(app).post('/auth/register').send(testUser);
//     console.log('Register response status:', registerResponse.status);
//     // Login to get authentication token
//     const loginResponse = await request(app).post('/auth/login').send({
//       email: testUser.email,
//       password: testUser.password,
//     });
//     console.log('Login response status:', loginResponse.status);
//     testUserId = loginResponse.body._id;
//     authToken = loginResponse.body.accessToken;
//     console.log('Test user ID:', testUserId);
//     console.log('Auth token obtained:', authToken ? 'Yes' : 'No');
//   } catch (error) {
//     console.error('Error in test setup:', error);
//     throw error; // Rethrow to fail the tests early
//   }
// });
// afterAll(async () => {
//   console.log('Cleaning up wishlist tests');
//   // Clean up test data
//   try {
//     await wishlistModel.deleteMany({});
//     await userModel.deleteMany({ email: 'wishlist-test@example.com' });
//   } catch (error) {
//     console.error('Cleanup error:', error);
//   }
//   // Close database connection
//   mongoose.connection.close();
// });
// describe('Wishlist API Tests', () => {
//   let wishlistItemId: string | undefined;
//   test('Should get empty wishlist for new user', async () => {
//     // Ensure we have an auth token before proceeding
//     if (!authToken) {
//       console.error('No auth token available, skipping test');
//       return;
//     }
//     const response = await request(app).get('/wishlist').set('Authorization', `Bearer ${authToken}`);
//     console.log('Get wishlist response status:', response.status);
//     console.log('Get wishlist response body:', response.body);
//     expect(response.status).toBe(200);
//     expect(Array.isArray(response.body)).toBeTruthy();
//     expect(response.body.length).toBe(0);
//   });
//   test('Should create new wishlist item', async () => {
//     // Ensure we have an auth token before proceeding
//     if (!authToken) {
//       console.error('No auth token available, skipping test');
//       return;
//     }
//     // Print detailed info for debugging
//     console.log('About to create wishlist item with:');
//     console.log('URL: /wishlist');
//     console.log('Auth: Bearer', authToken);
//     console.log('Data:', testWishlistItem);
//     const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${authToken}`).send(testWishlistItem);
//     // Detailed logging for debugging
//     console.log('Create wishlist response status:', response.status);
//     console.log('Create wishlist response body:', response.body);
//     // Check status code - allow either 200 or 201 for flexibility
//     expect([200, 201]).toContain(response.status);
//     // Check response properties with more detailed error messages
//     try {
//       expect(response.body).toHaveProperty('title');
//       expect(response.body.title).toBe(testWishlistItem.title);
//     } catch (e) {
//       console.error('Title check failed:', e);
//       console.error('Actual response body:', response.body);
//       throw e;
//     }
//     try {
//       expect(response.body).toHaveProperty('destination');
//       expect(response.body.destination).toBe(testWishlistItem.destination);
//     } catch (e) {
//       console.error('Destination check failed:', e);
//       throw e;
//     }
//     try {
//       expect(response.body).toHaveProperty('userId');
//     } catch (e) {
//       console.error('UserId check failed:', e);
//       throw e;
//     }
//     // Save the item ID if it exists
//     wishlistItemId = response.body._id;
//     console.log('Created wishlist item with ID:', wishlistItemId);
//   });
//   test('Should get wishlist with the created item', async () => {
//     // Skip this test if we don't have a wishlist item ID
//     if (!wishlistItemId || !authToken) {
//       console.log('Skipping test due to missing prerequisites');
//       return;
//     }
//     const response = await request(app).get('/wishlist').set('Authorization', `Bearer ${authToken}`);
//     console.log('Get updated wishlist response:', response.status);
//     expect(response.status).toBe(200);
//     expect(Array.isArray(response.body)).toBeTruthy();
//     // Look for the item we created
//     const found = response.body.some((item: any) => item.title === testWishlistItem.title && item.destination === testWishlistItem.destination);
//     if (!found) {
//       console.log('Created item not found in response. Response body:', response.body);
//     }
//     expect(found).toBeTruthy();
//   });
//   test('Should delete wishlist item', async () => {
//     // Skip if we don't have the necessary prerequisites
//     if (!wishlistItemId || !authToken) {
//       console.log('Skipping delete test due to missing prerequisites');
//       return;
//     }
//     const response = await request(app).delete(`/wishlist/${wishlistItemId}`).set('Authorization', `Bearer ${authToken}`);
//     console.log('Delete response:', response.status, response.body);
//     expect(response.status).toBe(200);
//     // Verify it's gone
//     const getResponse = await request(app).get('/wishlist').set('Authorization', `Bearer ${authToken}`);
//     expect(getResponse.status).toBe(200);
//     // Check it's no longer in the list
//     const stillExists = getResponse.body.some((item: any) => item._id === wishlistItemId);
//     expect(stillExists).toBeFalsy();
//   });
//   test('Should fail to delete non-existent wishlist item', async () => {
//     // Skip if no auth token
//     if (!authToken) {
//       console.log('Skipping test due to missing auth token');
//       return;
//     }
//     const fakeId = new mongoose.Types.ObjectId().toString();
//     const response = await request(app).delete(`/wishlist/${fakeId}`).set('Authorization', `Bearer ${authToken}`);
//     console.log('Delete non-existent item response:', response.status);
//     expect(response.status).toBe(404);
//   });
//   test('Should fail to access wishlist without auth token', async () => {
//     const response = await request(app).get('/wishlist');
//     expect(response.status).toBe(401);
//   });
//   test('Should fail to create wishlist item without auth token', async () => {
//     const response = await request(app).post('/wishlist').send(testWishlistItem);
//     expect(response.status).toBe(401);
//   });
//   test('Should fail to create wishlist item with invalid data', async () => {
//     // Skip if no auth token
//     if (!authToken) {
//       console.log('Skipping test due to missing auth token');
//       return;
//     }
//     const invalidItem = {
//       // Missing required fields
//       title: 'Incomplete Item',
//       // No description, destination, etc.
//     };
//     const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${authToken}`).send(invalidItem);
//     console.log('Invalid item response:', response.status, response.body);
//     expect(response.status).toBe(400);
//   });
//   test("Should not allow user to delete another user's wishlist item", async () => {
//     // Skip if no auth token
//     if (!authToken) {
//       console.log('Skipping test due to missing auth token');
//       return;
//     }
//     // First create an item with the first user
//     const createResponse = await request(app)
//       .post('/wishlist')
//       .set('Authorization', `Bearer ${authToken}`)
//       .send({
//         ...testWishlistItem,
//         title: 'Item for multi-user test',
//         description: 'This is a test item for the multi-user test',
//         destination: 'Tokyo, Japan',
//         duration: '5 days',
//         category: 'MODERATE',
//       });
//     console.log('Create item for multi-user test response:', createResponse.status, createResponse.body);
//     // If we couldn't create the item, skip the rest of the test
//     if (createResponse.status !== 201 && createResponse.status !== 200) {
//       console.log("Couldn't create test item, skipping remainder of test");
//       return;
//     }
//     const testItemId = createResponse.body._id;
//     if (!testItemId) {
//       console.log('Created item has no ID, skipping remainder of test');
//       return;
//     }
//     // Create another user
//     const anotherUser = {
//       email: 'another-wishlist-user@example.com',
//       password: 'password123',
//       name: 'Another User',
//     };
//     // Clean up any existing user first
//     await userModel.deleteMany({ email: anotherUser.email });
//     // Register the second user
//     const registerResponse = await request(app).post('/auth/register').send(anotherUser);
//     console.log('Second user registration response:', registerResponse.status);
//     if (registerResponse.status !== 200) {
//       console.log("Couldn't register second user, skipping remainder of test");
//       return;
//     }
//     // Login as the second user
//     const loginResponse = await request(app).post('/auth/login').send({
//       email: anotherUser.email,
//       password: anotherUser.password,
//     });
//     console.log('Second user login response:', loginResponse.status);
//     if (loginResponse.status !== 200) {
//       console.log("Couldn't log in as second user, skipping remainder of test");
//       return;
//     }
//     const anotherUserToken = loginResponse.body.accessToken;
//     // Try to delete the first user's item as the second user
//     const deleteResponse = await request(app).delete(`/wishlist/${testItemId}`).set('Authorization', `Bearer ${anotherUserToken}`);
//     console.log("Delete other user's item response:", deleteResponse.status);
//     // Should be 404 not found since it belongs to a different user
//     expect(deleteResponse.status).toBe(404);
//   });
// });
// src/test/wishlist-controller.test.ts
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