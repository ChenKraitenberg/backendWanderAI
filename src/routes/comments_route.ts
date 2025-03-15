import express from 'express';
const router = express.Router({ mergeParams: true }); // mergeParams מאפשר גישה ל־postId מהנתיב העליון
import commentsController from '../controllers/comments_controller';
import { authMiddleware } from '../controllers/auth_controller';

/**
 * @swagger
 * tags:
 *   name: Post Comments
 *   description: Endpoints for managing comments embedded in posts
 */

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Post Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: List of comments for the post
 *       404:
 *         description: Post not found
 */
router.get('/', commentsController.getAll.bind(commentsController));

/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   get:
 *     summary: Get a specific comment for a post
 *     tags: [Post Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Comment details
 *       404:
 *         description: Post or comment not found
 */
router.get('/:commentId', commentsController.getById.bind(commentsController));

// /**
//  * @swagger
//  * /posts/{postId}/comments:
//  *   post:
//  *     summary: Add a comment to a post
//  *     tags: [Post Comments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: postId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the post
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - text
//  *             properties:
//  *               text:
//  *                 type: string
//  *             example:
//  *               text: "This is a great post!"
//  *     responses:
//  *       201:
//  *         description: Comment created successfully
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Post not found
//  */
// router.post('/', authMiddleware, commentsController.create.bind(commentsController));

// for creat comment
/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Post Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *             example:
 *               text: "This is a great post!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/', authMiddleware, commentsController.create.bind(commentsController));
/**
 * @swagger
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment from a post
 *     tags: [Post Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post or comment not found
 */
router.delete('/:commentId', authMiddleware, commentsController.deleteItem.bind(commentsController));

export default router;
