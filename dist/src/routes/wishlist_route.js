"use strict";
// // src/routes/wishlist_route.ts
// import express, {Request, Response} from 'express';
// const router = express.Router();
// import wishlistController from '../controllers/wishlist_controller';
// import { authMiddleware } from '../controllers/auth_controller';
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
// // All routes require authentication
// router.use(authMiddleware);
// // Get all wishlist items for the current user
// router.get('/', wishlistController.getAll.bind(wishlistController));
// // Add an item to wishlist
// router.post('/', wishlistController.create.bind(wishlistController));
// // Remove an item from wishlist
// router.delete('/:id', async (req: express.Request, res: express.Response) => {
//     // Remove item from wishlist
//     try {
//         await wishlistController.delete(req, res);
//         res.status(200).json({ message: 'Item removed from wishlist' });
//     }
//     catch (error) {
//         console.error('Error removing wishlist item:', error);
//         res.status(500).json({ error: 'Failed to remove wishlist item' });
//     }
// });
// export default router;
// src/routes/wishlist_route.ts
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const wishlist_controller_1 = __importDefault(require("../controllers/wishlist_controller"));
const auth_controller_1 = require("../controllers/auth_controller");
// All routes require authentication
router.use(auth_controller_1.authMiddleware);
// Get all wishlist items for the current user
// router.get('/', async (req, res) => {
//   // The authMiddleware sets userId in req.params
//   await wishlistController.getAll(req, res);
// });
router.get('/', auth_controller_1.authMiddleware, wishlist_controller_1.default.getAll.bind(wishlist_controller_1.default));
// Add an item to wishlist
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // The authMiddleware sets userId in req.params
    yield wishlist_controller_1.default.create(req, res);
}));
// Remove an item from wishlist
// router.delete('/:id', async (req, res) => {
//   // The authMiddleware sets userId in req.params
//   await wishlistController.delete(req, res);
// });
router.delete('/:id', auth_controller_1.authMiddleware, wishlist_controller_1.default.delete.bind(wishlist_controller_1.default));
exports.default = router;
//# sourceMappingURL=wishlist_route.js.map