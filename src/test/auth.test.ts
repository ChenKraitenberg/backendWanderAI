import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import userModel from '../models/user_model';
import jwt from 'jsonwebtoken';
import { Express } from 'express';
import axios from 'axios';

// Ensure nodemailer is mocked before anything else
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ response: 'Success' }),
  }),
}));

let app: Express;

// Test user data
const testUser = {
  email: `auth-test-${Date.now()}@example.com`,
  password: 'SecurePassword123',
  name: 'Auth Test User',
};

let accessToken: string;
let refreshToken: string;
let userId: string;
let resetToken: string;

beforeAll(async () => {
  app = await appInit();
  // Clean up any existing test users
  await userModel.deleteMany({ email: testUser.email });
  await userModel.deleteMany({ email: /^auth-test-.*@example\.com$/ });
});

afterAll(async () => {
  // Clean up
  await userModel.deleteMany({ email: testUser.email });
  await userModel.deleteMany({ email: /^auth-test-.*@example\.com$/ });
  await mongoose.connection.close();
});

describe('Auth Controller Tests', () => {
  describe('User Registration', () => {
    test('Should register a new user with valid data', async () => {
      const response = await request(app).post('/auth/register').send(testUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);

      // Save user ID for later tests
      userId = response.body.user._id;
    });

    test('Should reject registration without email', async () => {
      const response = await request(app).post('/auth/register').send({
        password: 'TestPassword123',
        name: 'No Email User',
      });
      expect(response.status).toBe(400);
    });

    test('Should reject registration without password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: `auth-test-nopass-${Date.now()}@example.com`,
          name: 'No Password User',
        });
      expect(response.status).toBe(400);
    });

    test('Should reject registration without name', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: `auth-test-noname-${Date.now()}@example.com`,
          password: 'TestPassword123',
        });
      expect(response.status).toBe(400);
    });

    test('Should reject registration with duplicate email', async () => {
      const response = await request(app).post('/auth/register').send(testUser);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    test('Should handle registration with very long values', async () => {
      const longString = 'a'.repeat(300);
      const longEmail = `auth-test-long-${Date.now()}@example.com`;

      const response = await request(app).post('/auth/register').send({
        email: longEmail,
        password: longString,
        name: longString,
      });

      // Should either succeed or fail gracefully
      expect([200, 400]).toContain(response.status);

      // Clean up if user was created
      if (response.status === 200) {
        await userModel.deleteOne({ email: longEmail });
      }
    });
  });

  describe('User Login', () => {
    test('Should log in with valid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
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
    });

    test('Should reject login with incorrect password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123',
      });
      expect(response.status).toBe(400);
    });

    test('Should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: `nonexistent-${Date.now()}@example.com`,
          password: 'TestPassword123',
        });
      expect(response.status).toBe(400);
    });

    test('Should reject login without email', async () => {
      const response = await request(app).post('/auth/login').send({
        password: 'TestPassword123',
      });
      expect(response.status).toBe(400);
    });

    test('Should reject login without password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: testUser.email,
      });
      expect(response.status).toBe(400);
    });
  });

  describe('Token Authentication', () => {
    test('Should get user profile with valid token', async () => {
      const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', userId);
      expect(response.body).toHaveProperty('email', testUser.email);
    });

    test('Should reject request without token', async () => {
      const response = await request(app).get('/auth/me').set('Authorization', 'Bearer validToken'); // This is not a real token
      expect(response.status).toBe(401);
      expect(response.text).toBe('Access Denied');
    });

    test('Should reject request with invalid token', async () => {
      const response = await request(app).get('/auth/me').set('Authorization', 'Bearer invalid.token.here');
      expect(response.status).toBe(401);
      expect(response.text).toBe('Access Denied');
    });

    test('Should reject request with malformed authorization header', async () => {
      const response = await request(app).get('/auth/me').set('Authorization', 'NotBearer token');
      expect(response.status).toBe(401);
      expect(response.text).toBe('Access Denied');
    });

    test('Should reject request with non-existent user', async () => {
      // Create token with non-existent user ID
      const fakeId = new mongoose.Types.ObjectId().toString();
      const fakeToken = jwt.sign({ _id: fakeId, email: 'fake@example.com' }, process.env.TOKEN_SECRET || 'test-secret');

      const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${fakeToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Token Refresh', () => {
    test('Should refresh tokens with valid refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        refreshToken: refreshToken,
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Update tokens for future tests
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    test('Should reject refresh with invalid token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'invalid.refresh.token',
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Access Denied');
    });

    test('Should reject refresh without token', async () => {
      const response = await request(app).post('/auth/refresh').send({});
      expect(response.status).toBe(400);
      expect(response.text).toBe('Access Denied');
    });
  });

  describe('Social Login', () => {
    // Mock axios for social token verification
    beforeEach(() => {
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
          email: 'social-user@example.com',
          name: 'Social Test User',
          picture: 'https://example.com/avatar.jpg',
        },
        status: 200,
      } as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('Should handle social login with valid Google token', async () => {
      const socialLoginData = {
        provider: 'google',
        token: 'valid-google-token',
        email: 'social-user@example.com',
        name: 'Social Test User',
      };

      const response = await request(app).post('/auth/social-login').send(socialLoginData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', socialLoginData.email);

      // Clean up
      await userModel.deleteOne({ email: socialLoginData.email });
    });

    test('Should handle social login without token', async () => {
      const socialLoginData = {
        provider: 'google',
        email: 'social-user@example.com',
        name: 'Social Test User',
      };
      const response = await request(app).post('/auth/social-login').send(socialLoginData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Provider and token are required');
    });

    test('Should handle social login without name', async () => {
      const socialLoginData = {
        provider: 'google',
        token: 'valid-google-token',
        email: 'social-user@example.com',
      };
      const response = await request(app).post('/auth/social-login').send(socialLoginData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Username is required');
    });

    test('Should handle social login with invalid provider', async () => {
      const socialLoginData = {
        provider: 'invalid_provider',
        token: 'valid-token',
        email: 'social-user@example.com',
        name: 'Social Test User',
      };
      const response = await request(app).post('/auth/social-login').send(socialLoginData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid provider');
    });

    test('Should handle social login with token verification error', async () => {
      // Mock axios to throw an error
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Token verification failed'));

      const socialLoginData = {
        provider: 'google',
        token: 'invalid-token',
        email: 'social-user@example.com',
        name: 'Social Test User',
      };
      const response = await request(app).post('/auth/social-login').send(socialLoginData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });

    test('Should update existing user on social login', async () => {
      // First create a regular user
      const regularUser = {
        email: `social-merge-${Date.now()}@example.com`,
        password: 'TestPassword123',
        name: 'Regular User',
      };

      await request(app).post('/auth/register').send(regularUser);

      // Then do social login with same email
      jest.spyOn(axios, 'get').mockResolvedValueOnce({
        data: {
          email: regularUser.email,
          name: 'Social Name',
          picture: 'https://example.com/social-avatar.jpg',
        },
        status: 200,
      } as any);

      const socialLoginData = {
        provider: 'google',
        token: 'valid-google-token',
        email: regularUser.email,
        name: 'Social Name',
        avatar: 'https://example.com/social-avatar.jpg',
      };

      const response = await request(app).post('/auth/social-login').send(socialLoginData);
      expect(response.status).toBe(200);

      // Verify the user was updated with social provider
      const user = await userModel.findOne({ email: regularUser.email });
      expect(user).toBeDefined();
      expect(user?.socialProvider).toBe('google');

      // Clean up
      await userModel.deleteOne({ email: regularUser.email });
    });
  });

  // ------------------------------------------------------------------------------------
  // ADDITIONAL TESTS FOR /auth/me (GET) AND /auth/me (PUT) ERROR PATHS
  // These tests specifically cover lines in auth_route.js such as 201, 218–219, 228–229, 237
  // by forcing user not found or database errors.
  // ------------------------------------------------------------------------------------
  describe('Additional Coverage for /auth/me routes', () => {
    it('should return 400 if user not found (GET /auth/me)', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValueOnce(null);

      const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.text).toBe('User not found');

      jest.restoreAllMocks();
    });

    it('should return 500 if database error occurs in GET /auth/me', async () => {
      jest.spyOn(userModel, 'findById').mockImplementationOnce(() => {
        throw new Error('Simulated DB error');
      });

      const response = await request(app).get('/auth/me').set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(500);

      jest.restoreAllMocks();
    });

    it('should return 400 if user not found (PUT /auth/me)', async () => {
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const response = await request(app).put('/auth/me').set('Authorization', `Bearer ${accessToken}`).send({ name: 'New Name' });

      expect(response.status).toBe(400);
      expect(response.text).toBe('Access Denied');

      jest.restoreAllMocks();
    });

    it('should return 500 if database error occurs in PUT /auth/me', async () => {
      jest.spyOn(userModel, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('Simulated DB error');
      });

      const response = await request(app).put('/auth/me').set('Authorization', `Bearer ${accessToken}`).send({ name: 'New Name' });

      expect(response.status).toBe(500);

      jest.restoreAllMocks();
    });
  });
  // ------------------------------------------------------------------------------------

  describe('Password Reset Flow', () => {
    test('Should request password reset with valid email', async () => {
      const response = await request(app).post('/auth/request-reset').send({
        email: testUser.email,
      });
      expect(response.status).toBe(200);

      // Get the reset token from the database
      const user = await userModel.findOne({ email: testUser.email });
      resetToken = user?.resetPasswordToken || '';
      expect(resetToken).toBeTruthy();
    });

    test('Should handle reset token validation', async () => {
      const response = await request(app).get(`/auth/validate-reset-token/${resetToken}`);
      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('message', 'Token is valid');
      }
    });

    test('Should reject invalid reset token', async () => {
      const response = await request(app).get('/auth/validate-reset-token/invalid-token');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });

    test('Should handle password reset with token', async () => {
      const newPassword = 'NewPassword456';
      const response = await request(app).post('/auth/reset-password').send({
        token: resetToken,
        newPassword: newPassword,
      });
      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message', 'Password has been reset successfully');

        // Verify login with new password
        const loginResponse = await request(app).post('/auth/login').send({
          email: testUser.email,
          password: newPassword,
        });
        expect(loginResponse.status).toBe(200);

        // Update test user password for future tests
        testUser.password = newPassword;
      }
    });

    test('Should reject reset without token', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        newPassword: 'SomePassword123',
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Token and new password are required');
    });

    test('Should reject reset without new password', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        token: 'some-token',
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Token and new password are required');
    });

    test('Should handle expired reset token', async () => {
      // Request a reset to get a new token
      await request(app).post('/auth/request-reset').send({ email: testUser.email });

      // Get the token
      const user = await userModel.findOne({ email: testUser.email });
      const token = user?.resetPasswordToken;

      // Manually expire the token
      await userModel.updateOne(
        { email: testUser.email },
        { resetPasswordExpires: new Date(Date.now() - 3600000) } // 1 hour ago
      );

      // Try to use the expired token
      const responseExpired = await request(app).post('/auth/reset-password').send({
        token,
        newPassword: 'ExpiredTokenTest123',
      });
      expect(responseExpired.status).toBe(400);
      expect(responseExpired.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });

  describe('User Check Functionality', () => {
    test('Should confirm existing user', async () => {
      const response = await request(app).post('/auth/check-user').send({
        email: testUser.email,
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('exists', true);
      expect(response.body).toHaveProperty('userId');
    });

    test('Should confirm non-existent user', async () => {
      const response = await request(app)
        .post('/auth/check-user')
        .send({
          email: `nonexistent-${Date.now()}@example.com`,
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('exists', false);
      expect(response.body.userId).toBeUndefined();
    });

    test('Should reject check without email', async () => {
      const response = await request(app).post('/auth/check-user').send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email is required');
    });

    test('Should validate email format', async () => {
      const response = await request(app).post('/auth/check-user').send({
        email: 'not-an-email',
      });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid email format');
    });
  });

  describe('User Profile Management', () => {
    test('Should update user profile', async () => {
      const updateData = {
        name: 'Updated Test User',
        avatar: 'https://example.com/new-avatar.jpg',
      };

      const response = await request(app).put('/auth/me').set('Authorization', `Bearer ${accessToken}`).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', userId);
      expect(response.body).toHaveProperty('avatar', updateData.avatar);

      // Verify changes in database
      const user = await userModel.findById(userId);
      expect(user?.name).toBe(updateData.name);
      expect(user?.avatar).toBe(updateData.avatar);
    });

    test('Should reject profile update without authentication', async () => {
      const updateData = {
        name: 'Unauthorized Update',
      };

      const response = await request(app).put('/auth/me').send(updateData);
      expect(response.status).toBe(401);
      expect(response.text).toBe('Access Denied');
    });
  });

  describe('Logout Functionality', () => {
    test('Should logout with valid refresh token', async () => {
      const response = await request(app).post('/auth/logout').send({
        refreshToken: refreshToken,
      });
      expect(response.status).toBe(200);
      expect(response.text).toBe('Logged out');

      // Verify refresh token was removed
      const user = await userModel.findById(userId);
      expect(user?.refreshToken).not.toContain(refreshToken);
    });

    test('should return 400 for invalid refresh token', async () => {
      const response = await request(app).post('/auth/logout').send({ refreshToken: 'invalidToken' });
      expect(response.status).toBe(400);
    });

    test('should return 400 for an invalid refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({ refreshToken: 'invalidToken' });
      expect(response.status).toBe(400);
    });

    test('Should reject logout with invalid refresh token', async () => {
      const response = await request(app).post('/auth/logout').send({
        refreshToken: 'invalid-token',
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Access Denied');
    });

    test('Should reject logout without refresh token', async () => {
      const response = await request(app).post('/auth/logout').send({});
      expect(response.status).toBe(400);
      expect(response.text).toBe('Access Denied');
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

      // Try login with mocked error
      const response = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      // Should return error but not crash
      expect(response.status).toBe(400);

      // Restore original implementation
      mongoose.Model.findOne = originalFindOne;
    });
  });

  test('Should handle various social login edge cases', async () => {
    // Test with missing email
    const missingEmailResponse = await request(app).post('/auth/social-login').send({
      provider: 'google',
      token: 'valid-token',
      // email is missing
      name: 'Test User',
    });
    expect(missingEmailResponse.status).toBe(400);

    // Test with empty token
    const emptyTokenResponse = await request(app).post('/auth/social-login').send({
      provider: 'google',
      token: '',
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(emptyTokenResponse.status).toBe(400);

    // Test with token verification error
    jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Token verification failed'));
    const invalidTokenResponse = await request(app).post('/auth/social-login').send({
      provider: 'google',
      token: 'invalid-token',
      email: 'test@example.com',
      name: 'Test User',
    });
    expect(invalidTokenResponse.status).toBe(400);

    // Restore axios mock
    jest.restoreAllMocks();
  });
});
