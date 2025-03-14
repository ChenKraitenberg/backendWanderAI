"use strict";
// import express, { Request, Response } from 'express';
// import postsController from '../controllers/posts_controller';
// import { authMiddleware } from '../controllers/auth_controller';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = express.Router();
// router.get('/', postsController.getAll.bind(postsController));
// router.post('/:userId', authMiddleware, postsController.create.bind(postsController));
// router.delete('/:id/:userId', authMiddleware, postsController.deleteItem.bind(postsController));
// router.post('/:postId/comments', authMiddleware, postsController.create.bind(postsController));
// router.post('/like/:id/:userId', authMiddleware, postsController.toggleLike.bind(postsController));
// router.post('/comment/:id/:userId', authMiddleware, postsController.addComment.bind(postsController));
// router.get('/comments/:id', postsController.getComments.bind(postsController));
// router.get('/user/:userId', authMiddleware, postsController.getByUserId.bind(postsController));
// router.get('/paginated', postsController.getPaginatedPosts.bind(postsController));
// router.get('/:id', postsController.getById.bind(postsController));
// export default router;
const express_1 = __importDefault(require("express"));
const posts_controller_1 = __importDefault(require("../controllers/posts_controller"));
const auth_controller_1 = require("../controllers/auth_controller");
const router = express_1.default.Router();
// Specific routes first - these MUST come before the /:id route
router.get('/paginated', posts_controller_1.default.getPaginatedPosts.bind(posts_controller_1.default));
router.get('/user/:userId', posts_controller_1.default.getByUserId.bind(posts_controller_1.default));
router.get('/:id/comments', posts_controller_1.default.getComments.bind(posts_controller_1.default));
router.get('/search', posts_controller_1.default.searchPosts.bind(posts_controller_1.default));
// Regular CRUD operations on main resource
router.get('/', posts_controller_1.default.getAll.bind(posts_controller_1.default));
router.post('/', auth_controller_1.authMiddleware, posts_controller_1.default.create.bind(posts_controller_1.default));
router.get('/:id', posts_controller_1.default.getById.bind(posts_controller_1.default));
router.put('/:id', auth_controller_1.authMiddleware, posts_controller_1.default.update.bind(posts_controller_1.default));
router.delete('/:id', auth_controller_1.authMiddleware, posts_controller_1.default.deleteItem.bind(posts_controller_1.default));
// Actions on posts
router.post('/:id/like', auth_controller_1.authMiddleware, posts_controller_1.default.toggleLike.bind(posts_controller_1.default));
router.post('/:id/comment', auth_controller_1.authMiddleware, posts_controller_1.default.addComment.bind(posts_controller_1.default));
exports.default = router;
//# sourceMappingURL=posts_route.js.map