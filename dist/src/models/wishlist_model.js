"use strict";
// // src/models/wishlist_model.ts
// import mongoose from 'mongoose';
// const Schema = mongoose.Schema;
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// export interface IWishlistItem extends mongoose.Document {
//   title: string;
//   description: string;
//   destination: string;
//   duration: string;
//   category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
//   itinerary?: string[];
//   userId: string;
//   createdAt: Date;
//   image?: string;
// }
// const WishlistItemSchema = new Schema<IWishlistItem>({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   destination: {
//     type: String,
//     required: true,
//   },
//   duration: {
//     type: String,
//     required: true,
//   },
//   category: {
//     type: String,
//     enum: ['RELAXED', 'MODERATE', 'INTENSIVE'],
//     required: true,
//   },
//   itinerary: {
//     type: [String],
//   },
//   userId: {
//     type: Schema.Types.String,
//     ref: 'User',
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   image: {
//     type: String,
//   }
// });
// const WishlistModel = mongoose.model<IWishlistItem>('Wishlist', WishlistItemSchema);
// export default WishlistModel;
// src/models/wishlist_model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const WishlistItemSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['RELAXED', 'MODERATE', 'INTENSIVE'],
        required: true,
    },
    itinerary: {
        type: [String],
        required: false,
    },
    userId: {
        type: Schema.Types.String,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    image: {
        type: String,
        required: false,
    },
});
// Add index for better query performance
WishlistItemSchema.index({ userId: 1 });
// Add a pre-save hook for any custom logic before saving
WishlistItemSchema.pre('save', function (next) {
    // You can add custom logic here if needed
    next();
});
const WishlistModel = mongoose_1.default.model('Wishlist', WishlistItemSchema);
exports.default = WishlistModel;
//# sourceMappingURL=wishlist_model.js.map