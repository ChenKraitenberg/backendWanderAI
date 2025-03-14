// password-reset.test.ts
import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import userModel from '../models/user_model';
import { Express } from 'express';

// Increase the timeout if needed
jest.setTimeout(10000);

// Mock nodemailer at the very top so that it takes effect before any modules load
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ response: 'Success' }),
  }),
}));

let app: Express;
let resetToken: string;

beforeAll(async () => {
  app = await appInit();
  // Clean up any existing test user
  await userModel.deleteMany({ email: 'reset.user@example.com' });
  // Create a test user for password reset
  await userModel.create({
    email: 'reset.user@example.com',
    password: 'SecurePassword123', // Use plain text if login compares plain text
    name: 'Reset User',
  });
});

afterAll(async () => {
  await userModel.deleteMany({ email: 'reset.user@example.com' });
  await mongoose.connection.close();
});

describe('Password Reset API', () => {
  it('should request password reset', async () => {
    const response = await request(app).post('/auth/request-reset').send({ email: 'reset.user@example.com' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Password reset email sent');

    // Wait a moment to ensure the reset token is written in the database
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get the reset token from the database
    const user = await userModel.findOne({ email: 'reset.user@example.com' });
    resetToken = user?.resetPasswordToken as string;
    expect(resetToken).toBeDefined();
  });

  it('should validate the reset token', async () => {
    const response = await request(app).get(`/auth/validate-reset-token/${resetToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Token is valid');
  });

  it('should reset the password with a valid token', async () => {
    const newPassword = 'NewPassword123';
    const response = await request(app).post('/auth/reset-password').send({ token: resetToken, newPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Password has been reset successfully');

    // Verify that the token is removed from the user record
    const user = await userModel.findOne({ email: 'reset.user@example.com' });
    expect(user?.resetPasswordToken).toBeUndefined();
    expect(user?.resetPasswordExpires).toBeUndefined();
  });

  it('should be able to login with the new password', async () => {
    const response = await request(app).post('/auth/login').send({ email: 'reset.user@example.com', password: 'NewPassword123' });

    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });
});
