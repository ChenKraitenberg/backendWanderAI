// auth route
import express, { Request, Response } from 'express';
import authController, { authMiddleware } from '../controllers/auth_controller';
import userModel from '../models/user_model';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *       example:
 *         email: 'bob@gmail.com'
 *         password: '123456'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The new user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns JWT tokens
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 _id:
 *                   type: string
 *                   example: 60d0fe4f5311236168a109ca
 *       '400':
 *         description: Invalid input or wrong email or password
 *       '500':
 *         description: Internal server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Logs out a user by invalidating the refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       '200':
 *         description: Successful logout
 *       '400':
 *         description: Invalid refresh token
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT tokens
 *     description: Refreshes the access token using the refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       '200':
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '400':
 *         description: Invalid refresh token
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal server error
 */
router.post('/refresh', authController.refresh);

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      res.status(400).send('Access Denied');
      return;
    }
    // מחזירים רק מידע רלוונטי
    res.json({
      _id: user._id,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

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

// Social Login
/**
 * @swagger
 * /auth/social-login:
 *   post:
 *     summary: Login or register with social provider
 *     description: Authenticates a user with Google or Facebook token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 _id:
 *                   type: string
 */
router.post('/social-login', authController.socialLogin);

/**
 * @swagger
 * /auth/request-reset:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email with a token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Reset email sent
 *       '404':
 *         description: Email not found
 */
router.post('/request-reset', authController.requestPasswordReset);

/**
 * @swagger
 * /auth/validate-reset-token/{token}:
 *   get:
 *     summary: Validate reset token
 *     description: Checks if a password reset token is valid
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Token is valid
 *       '400':
 *         description: Invalid or expired token
 */
router.get('/validate-reset-token/:token', authController.validateResetToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets a user's password with a valid token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password successfully reset
 *       '400':
 *         description: Invalid token or password
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/check-user:
 *   post:
 *     summary: Check if a user exists
 *     description: Checks if a user exists with the provided email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *       '400':
 *         description: Missing email
 *       '500':
 *         description: Server error
 */
router.post('/check-user', authController.checkUserExists);

/**
 * @swagger
 * /auth/check-user:
 *   post:
 *     summary: Check if a user exists
 *     description: Checks if a user exists with the provided email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *       '400':
 *         description: Missing email
 *       '500':
 *         description: Server error
 */
router.post('/check-user', authController.checkUserExists);

export default router;
