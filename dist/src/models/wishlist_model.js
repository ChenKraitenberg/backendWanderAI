"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
    // image: {
    //   type: String,
    //   required: false,
    // },
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