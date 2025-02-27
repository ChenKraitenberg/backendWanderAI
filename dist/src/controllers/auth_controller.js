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
exports.authMiddleware = void 0;
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const password = req.body.password;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield user_model_1.default.create({
            email: req.body.email,
            password: hashedPassword
        });
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send("wrong email or password");
    }
});
const generateTokens = (user) => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString();
    const accessToken = jsonwebtoken_1.default.sign({
        _id: user._id,
        random: random
    }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRE });
    const refreshToken = jsonwebtoken_1.default.sign({
        _id: user._id,
        random: random
    }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
    if (user.refreshToken == null) {
        user.refreshToken = [];
    }
    user.refreshToken.push(refreshToken);
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //verify user & password
        const user = yield user_model_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send("wrong email or password");
            return;
        }
        const valid = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (!valid) {
            res.status(400).send("wrong email or password");
            return;
        }
        //generate tokens
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(400).send("Access Denied");
            return;
        }
        yield user.save();
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id
        });
    }
    catch (err) {
        res.status(400).send("wrong email or password");
    }
});
const verifyAccessToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        if (!refreshToken) {
            reject("Access Denied");
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            reject("Server Error");
            return;
        }
        jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                reject("Access Denied");
                return;
            }
            const userId = payload._id;
            try {
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    reject("Access Denied");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    yield user.save();
                    reject("Access Denied");
                    return;
                }
                user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
                resolve(user);
            }
            catch (err) {
                reject("Access Denied");
                return;
            }
        }));
    });
};
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield verifyAccessToken(req.body.refreshToken);
        yield user.save();
        res.status(200).send("Logged out");
    }
    catch (err) {
        res.status(400).send("Access Denied");
        return;
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield verifyAccessToken(req.body.refreshToken);
        //generate new tokens
        const tokens = generateTokens(user);
        yield user.save();
        if (!tokens) {
            res.status(400).send("Access Denied");
            return;
        }
        //send response
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
    catch (err) {
        res.status(400).send("Access Denied");
        return;
    }
});
const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization && authorization.split(" ")[1];
    if (!token) {
        res.status(401).send("Access Denied");
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(400).send("Server Error");
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(401).send("Access Denied");
            return;
        }
        const userId = payload._id;
        req.params.userId = userId;
        next();
    });
};
exports.authMiddleware = authMiddleware;
exports.default = {
    register,
    login,
    logout,
    refresh
};
//# sourceMappingURL=auth_controller.js.map