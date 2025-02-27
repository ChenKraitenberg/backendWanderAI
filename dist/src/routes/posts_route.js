"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const posts_controller_1 = __importDefault(require("../controllers/posts_controller"));
const auth_controller_1 = require("../controllers/auth_controller");
router.get("/", posts_controller_1.default.getAll.bind(posts_controller_1.default));
router.get("/:id", (req, res) => {
    posts_controller_1.default.getById(req, res);
});
router.post("/", auth_controller_1.authMiddleware, posts_controller_1.default.create.bind(posts_controller_1.default));
router.delete("/:id", auth_controller_1.authMiddleware, posts_controller_1.default.deleteItem.bind(posts_controller_1.default));
exports.default = router;
//# sourceMappingURL=posts_route.js.map