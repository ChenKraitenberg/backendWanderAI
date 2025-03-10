// src/routes/wishlist_route.ts
import express, {Request, Response} from 'express';
const router = express.Router();
import wishlistController from '../controllers/wishlist_controller';
import { authMiddleware } from '../controllers/auth_controller';

// All routes require authentication
router.use(authMiddleware);

// Get all wishlist items for the current user
router.get('/', wishlistController.getAll.bind(wishlistController));

// Add an item to wishlist
router.post('/', wishlistController.create.bind(wishlistController));

// Remove an item from wishlist
router.delete('/:id', async (req: express.Request, res: express.Response) => {
    // Remove item from wishlist
    try {
        await wishlistController.delete(req, res);
        res.status(200).json({ message: 'Item removed from wishlist' });
    }
    catch (error) {
        console.error('Error removing wishlist item:', error);
        res.status(500).json({ error: 'Failed to remove wishlist item' });
    }
});

export default router;