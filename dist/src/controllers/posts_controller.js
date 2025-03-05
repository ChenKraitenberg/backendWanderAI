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
const posts_model_1 = __importDefault(require("../models/posts_model"));
const base_controller_1 = __importDefault(require("./base_controller"));
class PostController extends base_controller_1.default {
    constructor() {
        super(posts_model_1.default);
    }
    create(req, res) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const post = Object.assign(Object.assign({}, req.body), { owner: userId });
            req.body = post;
            _super.create.call(this, req, res);
        });
    }
    update(req, res) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.userId;
            const post = Object.assign(Object.assign({}, req.body), { owner: userId });
            req.body = post;
            _super.update.call(this, req, res);
        });
    }
    addComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.postId;
            const comment = req.body;
            const post = yield posts_model_1.default.findById(postId);
            if (!post) {
                return res.status(404).send('Post not found');
            }
            post.comments.push(comment);
            yield post.save();
            res.send(post);
        });
    }
    // doLike
    doLike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = req.params.postId;
                const userId = req.userId; // מתוך הטוקן
                const post = yield this.model.findById(postId);
                if (!post) {
                    return res.status(404).send('Post not found');
                }
                // בדיקה אם המשתמש כבר נתן לייק
                const alreadyLiked = post.likes.includes(userId);
                if (!alreadyLiked) {
                    post.likes.push(userId);
                    yield post.save();
                }
                return res.json(post);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to like post' });
            }
        });
    }
}
exports.default = new PostController();
//# sourceMappingURL=posts_controller.js.map