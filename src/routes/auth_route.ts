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
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
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
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', authController.refresh);

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
 *       401:
 *         description: Unauthorized
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
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!user) {
      res.status(400).send('Access Denied');
      return;
    }
    res.json({
      _id: user._id,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
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
 *     responses:
 *       200:
 *         description: Social login successful
 *       401:
 *         description: Invalid social token
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
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       404:
 *         description: Email not found
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
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
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
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or password
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
 *     responses:
 *       200:
 *         description: User exists status
 */
router.post('/check-user', authController.checkUserExists);

// Removing duplicate route

export default router;
