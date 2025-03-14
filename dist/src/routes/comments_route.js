"use strict";
// import express, { Request, Response } from 'express';
// import { authMiddleware } from '../controllers/auth_controller';
// import commentsController from '../controllers/comments_controller';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// /**
//  * @swagger
//  * tags:
//  *   name: Comments
//  *   description: Comment management
//  */
// /**
//  * @swagger
//  * /comments:
//  *   get:
//  *     summary: Get all comments
//  *     tags: [Comments]
//  *     responses:
//  *       200:
//  *         description: List of comments
//  */
// router.get('/', commentsController.getAll);
// /**
//  * @swagger
//  * /comments/{id}:
//  *   get:
//  *     summary: Get comment by ID
//  *     tags: [Comments]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Comment details
//  *       400:
//  *         description: Invalid ID
//  *       404:
//  *         description: Comment not found
//  */
// router.get('/:id', authMiddleware, commentsController.getById);
// /**
//  * @swagger
//  * /comments:
//  *   post:
//  *     summary: Create a new comment
//  *     tags: [Comments]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - text
//  *               - postId
//  *     responses:
//  *       201:
//  *         description: Comment created
//  *       400:
//  *         description: Invalid input
//  *       401:
//  *         description: Unauthorized
//  */
// router.post('/', authMiddleware, commentsController.create);
// /**
//  * @swagger
//  * /comments/{id}:
//  *   put:
//  *     summary: Update comment
//  *     tags: [Comments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *     responses:
//  *       200:
//  *         description: Comment updated
//  *       400:
//  *         description: Invalid input
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Comment not found
//  */
// router.put('/:id', authMiddleware, commentsController.update);
// /**
//  * @swagger
//  * /comments/{id}:
//  *   delete:
//  *     summary: Delete comment
//  *     tags: [Comments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Comment deleted
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Comment not found
//  */
// router.delete('/:id', authMiddleware, commentsController.deleteItem);
// export default router;
// src/routes/comments_route.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const comments_controller_1 = __importDefault(require("../controllers/comments_controller"));
const auth_controller_1 = require("../controllers/auth_controller");
/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The Comments managing API
 */
// Get all comments
router.get('/', (req, res) => {
    comments_controller_1.default.getAll(req, res);
});
// Get comment by ID
router.get('/:id', (req, res) => {
    comments_controller_1.default.getById(req, res);
});
// Create a new comment (requires authentication)
router.post('/', auth_controller_1.authMiddleware, (req, res) => {
    comments_controller_1.default.create(req, res);
});
// Delete a comment (requires authentication)
router.delete('/:id', auth_controller_1.authMiddleware, (req, res) => {
    comments_controller_1.default.deleteItem(req, res);
});
exports.default = router;
//# sourceMappingURL=comments_route.js.map