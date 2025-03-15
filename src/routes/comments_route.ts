// import express from 'express';
// const router = express.Router();
// import commentsController from '../controllers/comments_controller';
// import { authMiddleware } from '../controllers/auth_controller';

// /**
//  * @swagger
//  * tags:
//  *   name: Comments
//  *   description: Comment management endpoints
//  */

// /**
//  * @swagger
//  * /comments:
//  *   get:
//  *     summary: Get all comments
//  *     tags: [Comments]
//  *     responses:
//  *       200:
//  *         description: List of all comments
//  */
// router.get('/', commentsController.getAll.bind(commentsController));

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
//  *       404:
//  *         description: Comment not found
//  */
// router.get('/:id', commentsController.getById.bind(commentsController));

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
//  *               - content
//  *               - postId
//  *             properties:
//  *               content:
//  *                 type: string
//  *               postId:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Comment created successfully
//  *       401:
//  *         description: Unauthorized
//  */
// router.post('/', authMiddleware, commentsController.create.bind(commentsController));
// /**
//  * @swagger
//  * /comments/{id}:
//  *   delete:
//  *     summary: Delete a comment
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
//  *         description: Comment deleted successfully
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Comment not found
//  */
// router.delete('/:id', authMiddleware, commentsController.deleteItem.bind(commentsController));

// export default router;

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
