import mongoose from 'mongoose';
import request from 'supertest';
import { Express } from 'express';
import initApp from '../server';
import userModel from '../models/user_model';

let app: Express;
let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
  app = await initApp();
  // Clear test user
  await userModel.deleteMany({ email: 'refresh.test@example.com' });

  // Create test user
  const response = await request(app).post('/auth/register').send({
    email: 'refresh.test@example.com',
    password: 'Test1234',
    name: 'Refresh Test User',
  });

  // Login to get tokens
  const loginResponse = await request(app).post('/auth/login').send({
    email: 'refresh.test@example.com',
    password: 'Test1234',
  });

  accessToken = loginResponse.body.accessToken;
  refreshToken = loginResponse.body.refreshToken;
});

afterAll(async () => {
  await userModel.deleteMany({ email: 'refresh.test@example.com' });
  await mongoose.connection.close();
});

describe('Token Refresh API', () => {
  it('should refresh tokens with valid refresh token', async () => {
    const response = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    // Update tokens for future tests
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('should reject invalid refresh tokens', async () => {
    const response = await request(app).post('/auth/refresh').send({ refreshToken: 'invalid-token' });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Access Denied');
  });

  it('should logout successfully', async () => {
    const response = await request(app).post('/auth/logout').send({ refreshToken });

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Logged out');
  });

  it('should reject refresh after logout', async () => {
    const response = await request(app).post('/auth/refresh').send({ refreshToken });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Access Denied');
  });
});
