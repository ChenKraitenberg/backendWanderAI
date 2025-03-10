// src/controllers/wishlist_controller.ts
import wishlistModel from "../models/wishlist_model";
import { Request, Response } from "express";

class WishlistController {
  // Get all wishlist items for a user
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const items = await wishlistModel.find({ userId });
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      res.status(500).json({ error: 'Failed to fetch wishlist items' });
    }
  }

  // Add item to wishlist
  async create(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      
      // Create wishlist item with user ID
      const wishlistItem = {
        ...req.body,
        userId
      };

      const newItem = await wishlistModel.create(wishlistItem);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating wishlist item:', error);
      res.status(500).json({ error: 'Failed to create wishlist item' });
    }
  }

  // Remove item from wishlist
  async delete(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const itemId = req.params.id;

      // Find and delete the item, ensuring it belongs to the user
      const result = await wishlistModel.findOneAndDelete({ 
        _id: itemId,
        userId: userId
      });

      if (!result) {
        return res.status(404).json({ error: 'Wishlist item not found' });
      }

      res.status(200).json({ message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Error removing wishlist item:', error);
      res.status(500).json({ error: 'Failed to remove wishlist item' });
    }
  }
}

export default new WishlistController();