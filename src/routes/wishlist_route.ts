import express from 'express';
const router = express.Router();
import wishlistController from '../controllers/wishlist_controller';
import { authMiddleware } from '../controllers/auth_controller';

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management endpoints
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get all wishlist items for the authenticated user
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wishlist items
 *       401:
 *         description: Unauthorized
 */
router.get('/', wishlistController.getAll.bind(wishlistController));

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add an item to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to wishlist
 *       401:
 *         description: Unauthorized
 */
router.post('/', wishlistController.create.bind(wishlistController));

/**
 * @swagger
 * /api/wishlist/{id}:
 *   delete:
 *     summary: Remove an item from wishlist
 *     tags: [Wishlist]
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
 *         description: Item removed from wishlist
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.delete('/:id', wishlistController.delete.bind(wishlistController));

export default router;
