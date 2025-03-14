"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// auth route
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importStar(require("../controllers/auth_controller"));
const user_model_1 = __importDefault(require("../models/user_model"));
const router = express_1.default.Router();
router.post('/register', auth_controller_1.default.register);
router.post('/login', auth_controller_1.default.login);
router.post('/logout', auth_controller_1.default.logout);
router.post('/refresh', auth_controller_1.default.refresh);
router.get('/me', auth_controller_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        // If we already sent a response via authMiddleware, don't try to send another one
        if (res.headersSent) {
            return;
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(400).send('User not found');
            return;
        }
        res.status(200).json({
            _id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        });
    }
    catch (error) {
        // Check if headers were already sent
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}));
router.put('/me', auth_controller_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findByIdAndUpdate(req.params.userId, req.body, { new: true });
        if (!user) {
            res.status(400).send('Access Denied');
            return;
        }
        res.json({
            _id: user._id,
            email: user.email,
            avatar: user.avatar,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
router.post('/social-login', auth_controller_1.default.socialLogin);
router.post('/request-reset', auth_controller_1.default.requestPasswordReset);
router.get('/validate-reset-token/:token', auth_controller_1.default.validateResetToken);
router.post('/reset-password', auth_controller_1.default.resetPassword);
router.post('/check-user', auth_controller_1.default.checkUserExists);
router.post('/check-user', auth_controller_1.default.checkUserExists);
exports.default = router;
//# sourceMappingURL=auth_route.js.map