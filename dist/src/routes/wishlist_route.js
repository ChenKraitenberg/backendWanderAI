"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const wishlist_controller_1 = __importDefault(require("../controllers/wishlist_controller"));
const auth_controller_1 = require("../controllers/auth_controller");
/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management endpoints
 */
// All routes require authentication
router.use(auth_controller_1.authMiddleware);
/**
 * @swagger
 * /wishlist:
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
router.get('/', wishlist_controller_1.default.getAll.bind(wishlist_controller_1.default));
/**
 * @swagger
 * /wishlist:
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
 *               - title
 *               - description
 *               - destination
 *               - duration
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the wishlist item.
 *               description:
 *                 type: string
 *                 description: A detailed description of the wishlist item.
 *               destination:
 *                 type: string
 *                 description: The destination associated with the wishlist item.
 *               duration:
 *                 type: string
 *                 description: The duration of the trip (e.g., "7 days").
 *               category:
 *                 type: string
 *                 enum: [RELAXED, MODERATE, INTENSIVE]
 *                 description: The category of the trip.
 *               itinerary:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional itinerary items.
 *             example:
 *               title: "Trip to Paris"
 *               description: "A wonderful trip to Paris with friends."
 *               destination: "Paris"
 *               duration: "7 days"
 *               category: "MODERATE"
 *               itinerary: ["Visit Eiffel Tower", "Cruise on the Seine"]
 *     responses:
 *       201:
 *         description: Item added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WishlistItem'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Missing required field(s)
 */
router.post('/', wishlist_controller_1.default.create.bind(wishlist_controller_1.default));
/**
 * @swagger
 * /wishlist/{id}:
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
router.delete('/:id', wishlist_controller_1.default.delete.bind(wishlist_controller_1.default));
exports.default = router;
//# sourceMappingURL=wishlist_route.js.map