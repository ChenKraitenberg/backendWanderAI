// auth route
import express, { Request, Response } from 'express';
import authController, { authMiddleware } from '../controllers/auth_controller';
import userModel from '../models/user_model';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *           example:
 *             email: "user@example.com"
 *             password: "securePassword123"
 *             name: "John Doe"
 *             avatar: "/uploads/default-avatar.png"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 _id: "67d4348796c4496fa09177fd"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 avatar: "/uploads/default-avatar.png"
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             example:
 *               message: "User already exists"
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             email: "user@example.com"
 *             password: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               _id: "67d4348796c4496fa09177fd"
 *               user:
 *                 _id: "67d4348796c4496fa09177fd"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 avatar: "/uploads/default-avatar.png"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               message: "Wrong email or password"
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: >
 *       Provides a new access token using a valid refresh token.
 *       Note that refresh tokens are invalidated after logout,
 *       so a new login will be required if you've logged out.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: A valid refresh token obtained during login or a previous refresh
 *           example:
 *             refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             example:
 *               accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid refresh token (expired, already used, or invalidated by logout)
 *         content:
 *           application/json:
 *             example:
 *               message: "Access Denied"
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Requires a valid refresh token. If you no longer have a valid refresh token, you may need to clear local storage and navigate to login.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Access Denied - Invalid or missing refresh token
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "67d4348796c4496fa09177fd"
 *               email: "user@example.com"
 *               name: "John Doe"
 *               avatar: "/uploads/default-avatar.png"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Access Denied"
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // If we already sent a response via authMiddleware, don't try to send another one
    if (res.headersSent) {
      return;
    }

    const user = await userModel.findById(userId);
    if (!user) {
      res.status(400).send('User not found');
      return;
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });
  } catch (error) {
    // Check if headers were already sent
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Update user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *           example:
 *             name: "John Smith"
 *             avatar: "/uploads/new-avatar.jpg"
 *     responses:
 *       200:
 *         description: User information updated successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "67d4348796c4496fa09177fd"
 *               email: "user@example.com"
 *               avatar: "/uploads/new-avatar.jpg"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Access Denied"
 */
// router.put('/me', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const user = await userModel.findByIdAndUpdate(req.params.userId, req.body, { new: true });
//     if (!user) {
//       res.status(400).send('Access Denied');
//       return;
//     }
//     res.json({
//       _id: user._id,
//       email: user.email,
//       avatar: user.avatar,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const updates = req.body;

    // Update the user document
    const user = await userModel.findByIdAndUpdate(userId, updates, { new: true });

    if (!user) {
      res.status(400).send('Access Denied');
      return;
    }

    // If the name was updated, update all comments by this user in posts
    if (updates.name) {
      const postModel = require('../models/posts_model').default;

      // Find all posts with comments by this user and update their names
      await postModel.updateMany(
        { 'comments.user._id': userId.toString() },
        {
          $set: {
            'comments.$[elem].user.name': updates.name,
          },
        },
        {
          arrayFilters: [{ 'elem.user._id': userId.toString() }],
          multi: true,
        }
      );

      console.log(`Updated username in all comments for user ${userId}`);
    }

    // If avatar was updated, update all comments by this user
    if (updates.avatar) {
      const postModel = require('../models/posts_model').default;

      await postModel.updateMany(
        { 'comments.user._id': userId.toString() },
        {
          $set: {
            'comments.$[elem].user.avatar': updates.avatar,
          },
        },
        {
          arrayFilters: [{ 'elem.user._id': userId.toString() }],
          multi: true,
        }
      );

      console.log(`Updated avatar in all comments for user ${userId}`);
    }

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
/**
 * @swagger
 * /auth/social-login:
 *   post:
 *     summary: Login with social provider
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - token
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [google, facebook]
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *           example:
 *             provider: "google"
 *             token: "google_oauth_token_here"
 *             email: "user@gmail.com"
 *             name: "Google User"
 *             avatar: "https://lh3.googleusercontent.com/profile_image"
 *     responses:
 *       200:
 *         description: Social login successful
 *         content:
 *           application/json:
 *             example:
 *               accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               _id: "67d4348796c4496fa09177fd"
 *               user:
 *                 _id: "67d4348796c4496fa09177fd"
 *                 email: "user@gmail.com"
 *                 name: "Google User"
 *                 avatar: "https://lh3.googleusercontent.com/profile_image"
 *       401:
 *         description: Invalid social token
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid token"
 */
router.post('/social-login', authController.socialLogin);

/**
 * @swagger
 * /auth/request-reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             example:
 *               message: "Password reset email sent"
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found"
 */
router.post('/request-reset', authController.requestPasswordReset);

/**
 * @swagger
 * /auth/validate-reset-token/{token}:
 *   get:
 *     summary: Validate reset token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: "a1b2c3d4e5f6g7h8i9j0"
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             example:
 *               message: "Token is valid"
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid or expired token"
 */
router.get('/validate-reset-token/:token', authController.validateResetToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *           example:
 *             token: "a1b2c3d4e5f6g7h8i9j0"
 *             newPassword: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password has been reset successfully"
 *       400:
 *         description: Invalid token or password
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid or expired token"
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/check-user:
 *   post:
 *     summary: Check if user exists
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: User exists status
 *         content:
 *           application/json:
 *             example:
 *               exists: true
 *               userId: "67d4348796c4496fa09177fd"
 */
router.post('/check-user', authController.checkUserExists);

export default router;
