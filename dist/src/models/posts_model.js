"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        required: true,
        default: new Date(),
    },
    likes: {
        type: [String],
        default: [],
    },
    comments: {
        type: [String],
        required: true,
        default: [],
    },
});
// לדאוג שבכל שמירה יתעדכן updatedAt
PostSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
const PostModel = mongoose_1.default.model('Post', PostSchema);
exports.default = PostModel;
//# sourceMappingURL=posts_model.js.map