"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/posts_model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const PostSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    maxSeats: {
        type: Number,
        required: true,
    },
    bookedSeats: {
        type: Number,
        //required: true,
    },
    image: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        enum: ['RELAXED', 'MODERATE', 'INTENSIVE'],
        default: 'RELAXED',
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    likes: {
        type: [String],
        default: [],
    },
    comments: [
        {
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
            text: {
                type: String,
                required: true,
            },
            postId: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    owner: {
        type: Schema.Types.String,
        ref: 'User',
        required: true,
    },
    userId: {
        type: Schema.Types.String,
        ref: 'User',
        required: true,
    },
    // Store user info directly in the post for easy display
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
            required: true,
        },
        avatar: {
            type: String,
        },
    },
});
// Update the updatedAt field on every save
PostSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const PostModel = mongoose_1.default.model('Post', PostSchema);
exports.default = PostModel;
//# sourceMappingURL=posts_model.js.map