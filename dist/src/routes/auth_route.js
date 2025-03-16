"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// auth route
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importStar(require("../controllers/auth_controller"));
const user_model_1 = __importDefault(require("../models/user_model"));
const router = express_1.default.Router();
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
router.post('/register', auth_controller_1.default.register);
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
router.post('/login', auth_controller_1.default.login);
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
router.post('/refresh', auth_controller_1.default.refresh);
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
router.post('/logout', auth_controller_1.default.logout);
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
router.get('/me', auth_controller_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        // If we already sent a response via authMiddleware, don't try to send another one
        if (res.headersSent) {
            return;
        }
        const user = yield user_model_1.default.findById(userId);
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
    }
    catch (error) {
        // Check if headers were already sent
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));
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
router.put('/me', auth_controller_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findByIdAndUpdate(req.params.userId, req.body, { new: true });
        if (!user) {
            res.status(400).send('Access Denied');
            return;
        }
        res.json({
            _id: user._id,
            email: user.email,
            avatar: user.avatar,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
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
router.post('/social-login', auth_controller_1.default.socialLogin);
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
router.post('/request-reset', auth_controller_1.default.requestPasswordReset);
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
router.get('/validate-reset-token/:token', auth_controller_1.default.validateResetToken);
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
router.post('/reset-password', auth_controller_1.default.resetPassword);
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
router.post('/check-user', auth_controller_1.default.checkUserExists);
exports.default = router;
//# sourceMappingURL=auth_route.js.map