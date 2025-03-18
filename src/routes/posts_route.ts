import express from 'express';
import postsController from '../controllers/posts_controller';
import { authMiddleware } from '../controllers/auth_controller';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management endpoints
 */

/**
 * @swagger
 * /posts/paginated:
 *   get:
 *     summary: Get paginated posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: Paginated list of posts
 */
router.get('/paginated', postsController.getPaginatedPosts.bind(postsController));

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's posts
 */
router.get('/user/:userId', postsController.getByUserId.bind(postsController));

/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments for the post
 *       404:
 *         description: Post not found
 */
router.get('/:id/comments', postsController.getComments.bind(postsController));

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Search posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching posts
 */
router.get('/search', postsController.searchPosts.bind(postsController));

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all posts
 */
router.get('/', postsController.getAll.bind(postsController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - startDate
 *               - endDate
 *               - price
 *               - maxSeats
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: The title of the post
 *               description:
 *                 type: string
 *                 description: Detailed description of the post
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the event
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the event
 *               price:
 *                 type: number
 *                 description: Price of the event
 *               maxSeats:
 *                 type: number
 *                 description: Maximum number of seats
 *               image:
 *                 type: string
 *                 description: URL of the image
 *             example:
 *               name: "Trip to Eilat"
 *               description: "A wonderful trip to Eilat with plenty of fun and sun."
 *               startDate: "2025-03-15T13:30:42.610Z"
 *               endDate: "2025-03-20T13:30:42.610Z"
 *               price: 200
 *               maxSeats: 50
 *               image: "/uploads/1741209156558-eilat.png"
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, postsController.create.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
//router.get('/:id', postsController.getById.bind(postsController));
router.get('/:id', postsController.getById.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Update a post partially - any field can be updated including the image
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the post (optional)
 *               description:
 *                 type: string
 *                 description: Detailed description of the post (optional)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: New start date (optional)
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: New end date (optional)
 *               price:
 *                 type: number
 *                 description: New price (optional)
 *               maxSeats:
 *                 type: number
 *                 description: New maximum seats (optional)
 *               tripType:
 *                 type: string
 *                 enum: ['RELAXED', 'MODERATE', 'INTENSIVE']
 *                 description: Intensity level of the trip (optional)
 *               destination:
 *                type: string
 *                description: New destination (optional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file to upload (optional)
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedPost:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid trip type. Must be one of: RELAXED, MODERATE, INTENSIVE"
 */
router.patch('/:id', authMiddleware, upload.single('image'), postsController.update.bind(postsController));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.delete('/:id', authMiddleware, postsController.deleteItem.bind(postsController));

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Toggle like for a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/:id/like', authMiddleware, postsController.toggleLike.bind(postsController));

router.post('/:id/comment', authMiddleware, postsController.addComment.bind(postsController));

export default router;
