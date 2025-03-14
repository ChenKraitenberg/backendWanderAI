import mongoose from 'mongoose';
import { Express } from 'express';
import initApp from '../server';
import request from 'supertest';

describe('Server Initialization Tests', () => {
  let app: Express;
  const originalEnv = process.env;

  beforeEach(() => {
    // Store original environment and restore between tests
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should initialize the server correctly', async () => {
    app = await initApp();
    expect(app).toBeDefined();

    // Test that routes are working
    const response = await request(app).get('/about');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  it('should handle missing database connection string', async () => {
    process.env.DB_CONNECTION = undefined;

    await expect(initApp()).rejects.toMatch('DB_CONNECTION is not defined');
  });

  it('should have CORS configured correctly', async () => {
    app = await initApp();

    const response = await request(app).options('/posts').set('Origin', 'http://localhost:5173');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toBeTruthy();
  });
});
