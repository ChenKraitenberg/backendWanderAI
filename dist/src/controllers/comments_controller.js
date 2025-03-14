"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/controllers/comments_controller.ts
const comments_model_1 = __importDefault(require("../models/comments_model"));
const base_controller_1 = __importDefault(require("./base_controller"));
class CommentsController extends base_controller_1.default {
    constructor() {
        super(comments_model_1.default);
    }
}
exports.default = new CommentsController();
//# sourceMappingURL=comments_controller.js.map