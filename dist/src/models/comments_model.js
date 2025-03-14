"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const CommentSchema = new Schema({
    text: {
        type: String,
        required: true,
        maxlength: 5000,
    },
    postId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        _id: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        avatar: {
            type: String,
        },
    },
});
const CommentModel = mongoose_1.default.model('Comment', CommentSchema);
exports.default = CommentModel;
//# sourceMappingURL=comments_model.js.map