import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import commentModel from '../models/comments_model';
import userModel from '../models/user_model';
import { Express } from 'express';

let app: Express;
const baseUrl = '/comments';

// Test user for authentication
const testUser = {
  email: 'comments.test@example.com',
  password: 'Test1234',
  name: 'Comments Test User',
};

let accessToken: string;
let userId: string;

// Test comments data
const testComments = [
  {
    text: 'This is test comment 1',
    postId: new mongoose.Types.ObjectId().toString(),
    user: {} as any, // Will be populated later
  },
  {
    text: 'This is test comment 2',
    postId: new mongoose.Types.ObjectId().toString(),
    user: {} as any, // Will be populated later
  },
];

beforeAll(async () => {
  console.log('Setting up comments test environment');
  app = await appInit();

  // Clean up before tests
  await userModel.deleteMany({ email: testUser.email });
  await commentModel.deleteMany({});

  // Register test user
  const registerRes = await request(app).post('/auth/register').send(testUser);
  expect(registerRes.statusCode).toBe(200);

  // Login to get authentication token
  const loginRes = await request(app).post('/auth/login').send({
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
});

afterAll(async () => {
  console.log('Cleaning up comments test environment');
  await userModel.deleteMany({ email: testUser.email });
  await commentModel.deleteMany({});
  await mongoose.connection.close();
});

describe('Comments API Tests', () => {
  // Initial test to verify empty comments collection
  test('Should return empty array when no comments exist', async () => {
    const response = await request(app).get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  // Test comment creation
  test('Should create new comments successfully', async () => {
    for (const comment of testComments) {
      const response = await request(app).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send(comment);

      expect(response.statusCode).toBe(201);
      expect(response.body.text).toBe(comment.text);
      expect(response.body.postId).toBe(comment.postId);
      expect(response.body.user._id).toBe(userId);

      // Store the created comment ID for later tests
      comment.user = response.body._id;
    }
  });

  // Test retrieving all comments
  test('Should retrieve all comments', async () => {
    const response = await request(app).get(baseUrl);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(testComments.length);
  });

  // Test retrieving a comment by ID
  test('Should retrieve a specific comment by ID', async () => {
    const commentId = testComments[0].user;
    const response = await request(app).get(`${baseUrl}/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentId);
    expect(response.body.text).toBe(testComments[0].text);
  });

  // Test filtering comments by user
  test('Should filter comments by user', async () => {
    const response = await request(app).get(`${baseUrl}?user._id=${userId}`).set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(testComments.length);

    // All returned comments should have the current user as owner
    response.body.forEach((comment: { user: { _id: string } }) => {
      expect(comment.user._id).toBe(userId);
    });
  });

  // Test filtering comments by postId
  test('Should filter comments by postId', async () => {
    const postId = testComments[0].postId;
    const response = await request(app).get(`${baseUrl}?postId=${postId}`).set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].postId).toBe(postId);
  });

  // Test deleting a comment
  test('Should delete a comment successfully', async () => {
    const commentId = testComments[0].user;
    const response = await request(app).delete(`${baseUrl}/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);

    // Verify the comment was deleted
    const checkResponse = await request(app).get(`${baseUrl}/${commentId}`).set('Authorization', `Bearer ${accessToken}`);

    expect(checkResponse.statusCode).toBe(404);
  });

  // Test comment creation with missing required fields
  test('Should reject comment creation with missing required fields', async () => {
    const incompleteRequests = [
      request(app).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({ text: 'Missing postId' }),

      request(app).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send({ postId: new mongoose.Types.ObjectId().toString() }), // Missing text
    ];

    const responses = await Promise.all(incompleteRequests);

    responses.forEach((response) => {
      expect(response.statusCode).toBe(400);
    });
  });
});
