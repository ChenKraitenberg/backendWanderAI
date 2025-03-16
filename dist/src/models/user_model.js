"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/user_model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: [String],
        default: [],
    },
    avatar: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    socialProvider: {
        type: String,
        enum: ['google', null],
        default: null,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
});
const userModel = mongoose_1.default.model('Users', userSchema);
exports.default = userModel;
//# sourceMappingURL=user_model.js.map