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
const comments_model_1 = __importDefault(require("../models/comments_model"));
const posts_model_1 = __importDefault(require("../models/posts_model"));
const base_controller_1 = __importDefault(require("./base_controller"));
const mongoose_1 = __importDefault(require("mongoose"));
class CommentsController extends base_controller_1.default {
    constructor() {
        super(comments_model_1.default);
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId, commentId } = req.params;
                const post = yield posts_model_1.default.findById(postId);
                if (!post) {
                    res.status(404).json({ error: 'Post not found' });
                    return;
                }
                const comment = post.comments.find((comment) => comment._id.toString() === commentId);
                if (!comment) {
                    res.status(404).json({ error: 'Comment not found' });
                    return;
                }
                res.status(200).json(comment);
            }
            catch (error) {
                console.error('Error getting comment:', error);
                res.status(500).json({ error: 'Failed to get comment' });
            }
        });
    }
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId, commentId } = req.params;
                const post = yield posts_model_1.default.findById(postId);
                if (!post) {
                    res.status(404).json({ error: 'Post not found' });
                    return;
                }
                const commentIndex = post.comments.findIndex((comment) => comment._id.toString() === commentId);
                if (commentIndex === -1) {
                    res.status(404).json({ error: 'Comment not found' });
                    return;
                }
                post.comments.splice(commentIndex, 1);
                yield post.save();
                res.status(204).send();
            }
            catch (error) {
                console.error('Error deleting comment:', error);
                res.status(500).json({ error: 'Failed to delete comment' });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId } = req.params;
                const { text } = req.body;
                if (!text) {
                    res.status(400).json({ error: 'Comment text is required' });
                    return;
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
                    res.status(400).json({ error: 'Invalid post ID format' });
                    return;
                }
                const post = yield posts_model_1.default.findById(postId);
                if (!post) {
                    res.status(404).json({ error: 'Post not found' });
                    return;
                }
                // השתמש ב-req.user שממולא על ידי authMiddleware
                const user = req.user;
                if (!user || !user._id || !user.email) {
                    res.status(401).json({ error: 'User not authenticated or incomplete user info' });
                    return;
                }
                const commentData = {
                    text,
                    postId,
                    createdAt: new Date(),
                    user: {
                        _id: user._id.toString(),
                        email: user.email,
                        name: user.name || 'Anonymous',
                        avatar: user.avatar,
                    },
                };
                post.comments.push(commentData);
                yield post.save();
                const newComment = post.comments[post.comments.length - 1];
                res.status(201).json(newComment);
            }
            catch (error) {
                console.error('Error creating comment:', error.message, error);
                res.status(500).json({ error: 'Failed to create comment' });
            }
        });
    }
}
exports.default = new CommentsController();
//# sourceMappingURL=comments_controller.js.map