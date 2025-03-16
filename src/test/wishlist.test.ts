import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import wishlistModel from '../models/wishlist_model';
import userModel from '../models/user_model';
import { Express } from 'express';
import jwt from 'jsonwebtoken';

let app: Express;
let accessToken: string;
let userId: string;
let testWishlistItemId: string;

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

beforeAll(async () => {
  app = await appInit();

  // Clean up any existing test data
  await userModel.deleteMany({ email: testUser.email });

  // Create test user
  const registerResponse = await request(app).post('/auth/register').send(testUser);

  // Login to get authentication token
  const loginResponse = await request(app).post('/auth/login').send({
    email: testUser.email,
    password: testUser.password,
  });

  accessToken = loginResponse.body.accessToken;
  userId = loginResponse.body._id;
});

afterAll(async () => {
  // Clean up test data
  await wishlistModel.deleteMany({ userId });
  await userModel.deleteMany({ email: testUser.email });
  await mongoose.connection.close();
});

describe('Wishlist Controller Tests', () => {
  describe('Wishlist Creation', () => {
    test('Should create wishlist item with valid data', async () => {
      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(testWishlistItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', testWishlistItem.title);
      expect(response.body).toHaveProperty('userId', userId);

      // Save ID for later tests
      testWishlistItemId = response.body._id;
    });

    test('Should reject creation without authentication', async () => {
      const response = await request(app).post('/wishlist').send(testWishlistItem);

      expect(response.status).toBe(401);
      // expect(response.body).toHaveProperty('error', 'User ID not found in request');
    });

    test('Should reject creation with missing title', async () => {
      const invalidItem = {
        ...testWishlistItem,
        title: undefined,
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: title');
    });

    test('Should reject creation with missing description', async () => {
      const invalidItem = {
        ...testWishlistItem,
        description: undefined,
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: description');
    });

    test('Should reject creation with missing destination', async () => {
      const invalidItem = {
        ...testWishlistItem,
        destination: undefined,
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: destination');
    });

    test('Should reject creation with missing duration', async () => {
      const invalidItem = {
        ...testWishlistItem,
        duration: undefined,
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: duration');
    });

    test('Should reject creation with missing category', async () => {
      const invalidItem = {
        ...testWishlistItem,
        category: undefined,
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidItem);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing required field: category');
    });

    test('Should create wishlist item with minimal required fields', async () => {
      const minimalItem = {
        title: 'Minimal Wishlist Item',
        description: 'Testing minimal fields',
        destination: 'Anywhere',
        duration: '3 days',
        category: 'RELAXED',
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(minimalItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', minimalItem.title);

      // Clean up
      await wishlistModel.findByIdAndDelete(response.body._id);
    });

    test('Should handle extremely long values', async () => {
      const longString = 'a'.repeat(1000);
      const longItem = {
        title: longString,
        description: longString,
        destination: longString,
        duration: longString,
        category: 'RELAXED',
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(longItem);

      // Should either succeed or fail gracefully, not crash
      expect([201, 400, 500]).toContain(response.status);

      // Clean up if created
      if (response.status === 201) {
        await wishlistModel.findByIdAndDelete(response.body._id);
      }
    });

    test('Should handle special characters in input', async () => {
      const specialItem = {
        title: 'Item with <script>alert("XSS")</script>',
        description: 'Description with special chars: !@#$%^&*()',
        destination: 'Destination with quotes "test" and \'test\'',
        duration: '7 days',
        category: 'RELAXED',
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(specialItem);

      // Should either succeed or fail gracefully, not crash
      expect([201, 400, 500]).toContain(response.status);

      // Clean up if created
      if (response.status === 201) {
        await wishlistModel.findByIdAndDelete(response.body._id);
      }
    });
  });

  describe('Wishlist Retrieval', () => {
    test('Should get all wishlist items for authenticated user', async () => {
      const response = await request(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();

      // Should contain at least the item we created
      expect(response.body.length).toBeGreaterThan(0);

      // Find our test item in the response
      const found = response.body.some((item: any) => item._id === testWishlistItemId);
      expect(found).toBeTruthy();
    });

    test('Should reject retrieval without authentication', async () => {
      const response = await request(app).get('/wishlist');

      expect(response.status).toBe(401);
      console.log(response.body);
    });

    test('Should handle empty wishlist', async () => {
      // Create a new user with empty wishlist
      const emptyUser = {
        email: `empty-wishlist-${Date.now()}@example.com`,
        password: 'SecurePassword123',
        name: 'Empty Wishlist User',
      };

      await request(app).post('/auth/register').send(emptyUser);

      const loginResponse = await request(app).post('/auth/login').send({
        email: emptyUser.email,
        password: emptyUser.password,
      });

      const emptyUserToken = loginResponse.body.accessToken;

      const response = await request(app).get('/wishlist').set('Authorization', `Bearer ${emptyUserToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);

      // Clean up
      await userModel.deleteOne({ email: emptyUser.email });
    });

    test('Should handle invalid authorization token format', async () => {
      const response = await request(app).get('/wishlist').set('Authorization', 'InvalidToken');

      expect(response.status).toBe(401);
    });
  });

  describe('Wishlist Deletion', () => {
    test('Should delete wishlist item by ID', async () => {
      // First create an item to delete
      const newItem = {
        title: 'Item to Delete',
        description: 'This item will be deleted',
        destination: 'Nowhere',
        duration: '5 days',
        category: 'RELAXED',
      };

      const createResponse = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(newItem);

      const itemId = createResponse.body._id;

      // Now delete it
      const deleteResponse = await request(app).delete(`/wishlist/${itemId}`).set('Authorization', `Bearer ${accessToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message', 'Item removed from wishlist');

      // Verify it's gone
      const getResponse = await request(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);

      const stillExists = getResponse.body.some((item: any) => item._id === itemId);
      expect(stillExists).toBeFalsy();
    });

    test('Should reject deletion without authentication', async () => {
      const response = await request(app).delete(`/wishlist/${testWishlistItemId}`);

      expect(response.status).toBe(401);
      console.log(response.body);
    });

    test('Should reject deletion of non-existent item', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app).delete(`/wishlist/${fakeId}`).set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Wishlist item not found');
    });

    test('Should reject deletion with invalid ID format', async () => {
      const response = await request(app).delete('/wishlist/invalid-id-format').set('Authorization', `Bearer ${accessToken}`);

      // Should handle invalid ID gracefully
      expect([400, 404, 500]).toContain(response.status);
    });

    test("Should not allow deleting another user's wishlist item", async () => {
      // Create another user
      const anotherUser = {
        email: `another-wishlist-${Date.now()}@example.com`,
        password: 'SecurePassword123',
        name: 'Another Wishlist User',
      };

      await request(app).post('/auth/register').send(anotherUser);

      const loginResponse = await request(app).post('/auth/login').send({
        email: anotherUser.email,
        password: anotherUser.password,
      });

      const anotherUserToken = loginResponse.body.accessToken;

      // Try to delete the first user's item
      const response = await request(app).delete(`/wishlist/${testWishlistItemId}`).set('Authorization', `Bearer ${anotherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Wishlist item not found');

      // Clean up
      await userModel.deleteOne({ email: anotherUser.email });
    });
  });

  describe('Error Handling', () => {
    test('Should handle database errors gracefully', async () => {
      // Save original implementation
      const originalFindOne = mongoose.Model.findOne;

      // Mock findOne to throw error
      mongoose.Model.findOne = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      // Try to delete with mocked error
      const response = await request(app).delete(`/wishlist/${testWishlistItemId}`).set('Authorization', `Bearer ${accessToken}`);

      // Should return error but not crash
      expect([400, 500]).toContain(response.status);

      // Restore original implementation
      mongoose.Model.findOne = originalFindOne;
    });

    test('Should handle token extraction errors', async () => {
      // Create invalid token
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkludmFsaWQgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.invalid-signature';

      const response = await request(app).get('/wishlist').set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    test('Should handle invalid category values gracefully', async () => {
      const invalidCategoryItem = {
        title: 'Invalid Category Test',
        description: 'Testing invalid category',
        destination: 'Test Destination',
        duration: '7 days',
        category: 'INVALID_CATEGORY', // Invalid category
      };

      const response = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(invalidCategoryItem);

      // Should handle gracefully (either accept it or return a proper error)
      expect([201, 400, 500]).toContain(response.status);

      // Clean up if created
      if (response.status === 201) {
        await wishlistModel.findByIdAndDelete(response.body._id);
      }
    });
  });

  // Tests for getUserId functionality
  describe('User ID Extraction', () => {
    test('Should extract userId from auth token', async () => {
      // This is implicitly tested by the successful creation and retrieval tests
      // but we can add an explicit test if needed
      const response = await request(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    test('Should extract userId from query parameters', async () => {
      // Create a valid token but use query param instead
      const response = await request(app).get(`/wishlist?userId=${userId}`).set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });
  });
  test('Should handle wishlist edge cases', async () => {
    // Test with empty fields
    const emptyFieldsItem = {
      title: 'Empty Fields Test',
      description: '',
      destination: '',
      duration: '',
      category: 'RELAXED',
    };

    const emptyFieldsResponse = await request(app).post('/wishlist').set('Authorization', `Bearer ${accessToken}`).send(emptyFieldsItem);

    // Should either accept or reject with proper error
    expect([201, 400, 500]).toContain(emptyFieldsResponse.status);

    // Test with invalid ObjectId
    const invalidIdResponse = await request(app).get('/wishlist/not-a-valid-id').set('Authorization', `Bearer ${accessToken}`);

    expect([400, 404]).toContain(invalidIdResponse.status);

    // Test database error handling
    const originalFind = mongoose.Model.find;
    mongoose.Model.find = jest.fn().mockImplementationOnce(() => {
      throw new Error('Mock database error');
    });

    const errorResponse = await request(app).get('/wishlist').set('Authorization', `Bearer ${accessToken}`);

    // Should handle error gracefully
    expect([400, 500]).toContain(errorResponse.status);

    // Restore original method
    mongoose.Model.find = originalFind;
  });
});
