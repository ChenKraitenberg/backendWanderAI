"use strict";
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
const wishlist_model_1 = __importDefault(require("../models/wishlist_model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Helper to extract userId from different parts of the request
const getUserId = (req) => {
    // Check if set by authMiddleware in params
    if (req.params && req.params.userId) {
        return req.params.userId;
    }
    // Check if set in query params
    if (req.query && req.query.userId) {
        return req.query.userId;
    }
    // Check if set by authMiddleware in a custom property
    if (req.userId) {
        return req.userId;
    }
    // Last resort: try to extract from Authorization header
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
            return decoded._id;
        }
    }
    catch (error) {
        console.error('Error extracting userId from token:', error);
    }
    return null;
};
class WishlistController {
    // Get all wishlist items for a user
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = getUserId(req);
                if (!userId) {
                    console.error('No userId found in request');
                    res.status(401).json({ error: 'User ID not found in request' });
                    return;
                }
                console.log(`Fetching wishlist items for user: ${userId}`);
                const items = yield wishlist_model_1.default.find({ userId });
                res.status(200).json(items);
                return;
            }
            catch (error) {
                console.error('Error in getAll wishlist:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to fetch wishlist items' });
                    return;
                }
            }
        });
    }
    // Add item to wishlist
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = getUserId(req);
                if (!userId) {
                    console.error('No userId found in request');
                    res.status(401).json({ error: 'User ID not found in request' });
                    return;
                }
                console.log(`Creating wishlist item for user: ${userId}`, req.body);
                // Validate required fields
                const { title, description, destination, duration, category } = req.body;
                if (!title) {
                    res.status(400).json({ error: 'Missing required field: title' });
                    return;
                }
                if (!description) {
                    res.status(400).json({ error: 'Missing required field: description' });
                    return;
                }
                if (!destination) {
                    res.status(400).json({ error: 'Missing required field: destination' });
                    return;
                }
                if (!duration) {
                    res.status(400).json({ error: 'Missing required field: duration' });
                    return;
                }
                if (!category) {
                    res.status(400).json({ error: 'Missing required field: category' });
                    return;
                }
                // Create wishlist item with user ID
                const wishlistItem = Object.assign(Object.assign({}, req.body), { userId });
                console.log('Creating wishlist item with data:', wishlistItem);
                const newItem = yield wishlist_model_1.default.create(wishlistItem);
                console.log('Successfully created wishlist item:', newItem._id);
                res.status(201).json(newItem);
                return;
            }
            catch (error) {
                console.error('Error in create wishlist:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: 'Failed to create wishlist item',
                        details: error instanceof Error ? error.message : 'Unknown error',
                    });
                    return;
                }
            }
        });
    }
    // Remove item from wishlist
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = getUserId(req);
                if (!userId) {
                    console.error('No userId found in request');
                    res.status(401).json({ error: 'User ID not found in request' });
                    return;
                }
                const itemId = req.params.id;
                console.log(`Deleting wishlist item: ${itemId} for user: ${userId}`);
                // Find the item first to check if it exists and belongs to the user
                const item = yield wishlist_model_1.default.findOne({
                    _id: itemId,
                    userId: userId,
                });
                if (!item) {
                    res.status(404).json({ error: 'Wishlist item not found' });
                    return;
                }
                // Now delete it
                yield wishlist_model_1.default.findByIdAndDelete(itemId);
                res.status(200).json({ message: 'Item removed from wishlist' });
                return;
            }
            catch (error) {
                console.error('Error in delete wishlist:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to remove wishlist item' });
                    return;
                }
            }
        });
    }
}
exports.default = new WishlistController();
//# sourceMappingURL=wishlist_controller.js.map