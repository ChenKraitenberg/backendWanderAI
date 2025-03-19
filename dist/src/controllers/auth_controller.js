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
exports.authMiddleware = exports.register = void 0;
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, avatar } = req.body;
        // Check for required fields
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        // Name is now required
        if (!name) {
            res.status(400).json({ message: 'Username is required' });
            return;
        }
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new user
        const user = yield user_model_1.default.create({
            email,
            password: hashedPassword,
            name, // Save the username
            avatar: avatar || null,
        });
        // const token = jwt.sign(
        //   { _id: user._id, email: user.email, name: user.name, avatar: user.avatar },
        //   process.env.TOKEN_SECRET as string,
        //   { expiresIn: process.env.TOKEN_EXPIRE as string } as jwt.SignOptions
        // );
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(500).json({ message: 'Failed to generate authentication tokens' });
            return;
        }
        // Return response
        // res.status(200).json({
        //   token,
        //   user: {
        //     _id: user._id,
        //     email: user.email,
        //     name: user.name,
        //     avatar: user.avatar,
        //   },
        // });
        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(400).send('Something went wrong in register process.');
    }
});
exports.register = register;
// const generateTokens = (user: IUser): { accessToken: string; refreshToken: string } | null => {
//   if (!process.env.TOKEN_SECRET) {
//     return null;
//   }
//   const random = Math.random().toString();
//   const accessToken = jwt.sign(
//     { _id: user._id, email: user.email, name: user.name, avatar: user.avatar },
//     process.env.TOKEN_SECRET as string,
//     { expiresIn: process.env.TOKEN_EXPIRE as string } as jwt.SignOptions
//   );
//   const refreshToken = jwt.sign(
//     { _id: user._id, email: user.email, name: user.name, avatar: user.avatar },
//     process.env.TOKEN_SECRET as string,
//     { expiresIn: process.env.REFRESH_TOKEN_EXPIRE as string } as jwt.SignOptions
//   );
//   if (user.refreshToken == null) {
//     user.refreshToken = [];
//   }
//   user.refreshToken.push(refreshToken);
//   return {
//     accessToken: accessToken,
//     refreshToken: refreshToken,
//   };
// };
const generateTokens = (user) => {
    try {
        if (!process.env.TOKEN_SECRET) {
            throw new Error('TOKEN_SECRET is not defined');
        }
        // Validate token expiration
        const accessTokenExpire = process.env.TOKEN_EXPIRE || '1h';
        const refreshTokenExpire = process.env.REFRESH_TOKEN_EXPIRE || '7d';
        const accessToken = jsonwebtoken_1.default.sign({
            _id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        }, process.env.TOKEN_SECRET, { expiresIn: accessTokenExpire });
        const refreshToken = jsonwebtoken_1.default.sign({
            _id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        }, process.env.TOKEN_SECRET, { expiresIn: refreshTokenExpire });
        // Ensure refreshToken array exists
        user.refreshToken = user.refreshToken || [];
        user.refreshToken.push(refreshToken);
        return { accessToken, refreshToken };
    }
    catch (error) {
        console.error('Token generation error:', error);
        return null;
    }
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify user & password
        const user = yield user_model_1.default.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send('Wrong email or password');
            return;
        }
        const valid = yield bcrypt_1.default.compare(req.body.password, user.password);
        if (!valid) {
            res.status(400).send('Wrong email or password');
            return;
        }
        // Generate tokens
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(400).send('Access Denied');
            return;
        }
        yield user.save();
        // Return user info with tokens
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        });
    }
    catch (err) {
        res.status(400).send('Wrong email or password');
    }
});
// const verifyAccessToken = (refreshToken: string | undefined) => {
//   return new Promise<UserDocument>((resolve, reject) => {
//     if (!refreshToken) {
//       reject('Access Denied');
//       return;
//     }
//     if (!process.env.TOKEN_SECRET) {
//       reject('Server Error');
//       return;
//     }
//     jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
//       if (err) {
//         reject('Access Denied');
//         return;
//       }
//       const userId = payload._id;
//       try {
//         const user = await userModel.findById(userId);
//         if (!user) {
//           reject('Access Denied');
//           return;
//         }
//         if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
//           user.refreshToken = [];
//           await user.save();
//           reject('Access Denied');
//           return;
//         }
//         user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
//         resolve(user);
//       } catch (err) {
//         reject('Access Denied');
//         return;
//       }
//     });
//   });
// };
const verifyAccessToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        if (!refreshToken) {
            reject('Access Denied');
            return;
        }
        // if (!process.env.REFRESH_TOKEN_SECRET) {
        //   reject('Server Error');
        //   return;
        // }
        if (!process.env.TOKEN_SECRET) {
            reject('Server Error');
            return;
        }
        jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                reject('Access Denied');
                return;
            }
            const userId = payload._id;
            try {
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    reject('Access Denied');
                    return;
                }
                // Ensure refresh token exists in the user's refreshToken array
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    reject('Invalid refresh token');
                    return;
                }
                // Remove used refresh token and save the user
                user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
                yield user.save();
                resolve(user);
            }
            catch (err) {
                reject('Access Denied');
                return;
            }
        }));
    });
};
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield verifyAccessToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send('Access Denied');
            return;
        }
        // Remove the refresh token
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken = user.refreshToken.filter((token) => token !== req.body.refreshToken);
        yield user.save();
        res.status(200).send('Logged out');
    }
    catch (err) {
        console.error('Logout error:', err);
        res.status(400).send('Access Denied');
    }
});
// const refresh = async (req: Request, res: Response) => {
//   try {
//     const user = await verifyAccessToken(req.body.refreshToken);
//     // Generate new tokens
//     const tokens = generateTokens(user);
//     await user.save();
//     if (!tokens) {
//       res.status(400).send('Access Denied');
//       return;
//     }
//     // Send response
//     res.status(200).send({
//       accessToken: tokens.accessToken,
//       refreshToken: tokens.refreshToken,
//     });
//   } catch (err) {
//     res.status(400).send('Access Denied');
//     return;
//   }
// };
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield verifyAccessToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send('Access Denied');
            return;
        }
        // Generate new tokens
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(500).send('Could not generate tokens');
            return;
        }
        yield user.save(); // Ensure user is saved with the new refreshToken
        // Send response
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    }
    catch (err) {
        console.error('Refresh error:', err);
        res.status(400).send({ message: 'Access Denied', error: err });
    }
});
// In auth_controller.ts, ensure the authMiddleware function is properly handling the token
// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const authorization = req.headers.authorization;
//   // Debugging info
//   console.log('Auth header received:', authorization);
//   const token = authorization && authorization.split(' ')[1];
//   if (!token) {
//     console.log('No token provided');
//     res.status(401).send('Access Denied');
//     return;
//   }
//   if (!process.env.TOKEN_SECRET) {
//     console.log('Server missing TOKEN_SECRET');
//     res.status(500).send('Server Error');
//     return;
//   }
//   jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
//     if (err) {
//       console.error('Token verification error:', err);
//       res.status(401).send('Access Denied');
//       return;
//     }
//     console.log('JWT Payload:', payload);
//     // Set both user and userId params
//     req.user = payload as { _id: string; email: string; name?: string; avatar?: string };
//     req.params.userId = req.user._id;
//     next();
//   });
// };
const authMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            res.status(401).json({
                message: 'Authorization header is missing',
                error: 'Unauthorized',
            });
            return;
        }
        const token = authorization.split(' ')[1];
        if (!token) {
            res.status(401).json({
                message: 'Bearer token is missing',
                error: 'Unauthorized',
            });
        }
        if (!process.env.TOKEN_SECRET) {
            res.status(500).json({
                message: 'Server configuration error',
                error: 'Missing token secret',
            });
            return;
        }
        jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
            if (err) {
                let errorMessage = 'Invalid token';
                switch (err.name) {
                    case 'TokenExpiredError':
                        errorMessage = 'Token has expired';
                        break;
                    case 'JsonWebTokenError':
                        errorMessage = 'Invalid token signature';
                        break;
                }
                return res.status(401).json({
                    message: errorMessage,
                    error: 'Unauthorized',
                });
            }
            // Attach user to request
            req.user = payload;
            req.params.userId = req.user._id;
            next();
        });
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            message: 'Internal server error during authentication',
            error: 'Server Error',
        });
    }
};
exports.authMiddleware = authMiddleware;
const socialLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, token, email, name, avatar } = req.body;
        console.log('Social login request received:', { provider, email, name });
        if (!token || !provider) {
            console.log('Missing provider or token');
            res.status(400).json({ message: 'Provider and token are required' });
            return;
        }
        // Name is now required
        if (!name) {
            console.log('Missing name in social login request');
            res.status(400).json({ message: 'Username is required' });
            return;
        }
        let userData;
        let socialEmail;
        // Verify token with provider
        try {
            if (provider === 'google') {
                // Verify Google token
                const googleResponse = yield axios_1.default.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
                const googleData = googleResponse.data;
                socialEmail = googleData.email;
                console.log('Verified Google token for email:', socialEmail);
                if (!socialEmail) {
                    console.log('Invalid Google token - no email returned');
                    res.status(400).json({ message: 'Invalid Google token' });
                    return;
                }
            }
            else {
                console.log('Invalid provider:', provider);
                res.status(400).json({ message: 'Invalid provider' });
                return;
            }
        }
        catch (error) {
            console.error('Error verifying social token:', error);
            res.status(400).json({ message: 'Invalid token' });
            return;
        }
        // CRITICAL FIX: First look for a user with matching email, case insensitive
        const emailToUse = socialEmail || email;
        if (!emailToUse) {
            console.log('No email available for user lookup');
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        console.log('Looking for existing user with email:', emailToUse);
        // Use a case-insensitive regex to find the user by email
        let user = yield user_model_1.default.findOne({
            email: { $regex: new RegExp('^' + emailToUse.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        });
        if (user) {
            console.log('Existing user found with matching email:', user._id);
            // Update the user information if needed
            let needsUpdate = false;
            // Update name if it was empty before
            if (!user.name || user.name === 'Anonymous') {
                console.log('Updating user name from', user.name, 'to', name);
                user.name = name;
                needsUpdate = true;
            }
            // Update avatar if none exists and one is provided
            if (!user.avatar && avatar) {
                console.log('Updating user avatar');
                user.avatar = avatar;
                needsUpdate = true;
            }
            // Always update social provider when using social login
            // This is the fix - update socialProvider regardless of previous value
            console.log('Setting social provider to', provider);
            user.socialProvider = provider;
            needsUpdate = true;
            if (needsUpdate) {
                console.log('Saving updated user information');
                try {
                    yield user.save();
                    console.log('User updated successfully');
                }
                catch (saveError) {
                    console.error('Error updating user:', saveError);
                }
            }
        }
        else {
            // No existing user found, create a new one
            console.log('No existing user found with email', emailToUse, '- creating new user');
            const randomPassword = crypto_1.default.randomBytes(20).toString('hex');
            const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
            user = yield user_model_1.default.create({
                email: emailToUse,
                password: hashedPassword,
                name: name,
                avatar: avatar || null,
                socialProvider: provider,
            });
            console.log('New user created with ID:', user._id);
        }
        // Generate tokens
        const tokens = generateTokens(user);
        if (!tokens) {
            console.log('Failed to generate authentication tokens');
            res.status(500).json({ message: 'Failed to generate authentication tokens' });
            return;
        }
        // Add refresh token to user
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        yield user.save();
        console.log('Login successful for user ID:', user._id);
        // Return tokens and user info
        res.status(200).json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            _id: user._id,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        console.error('Social login error:', error);
        res.status(500).json({ message: 'Server error during social login' });
    }
});
// Request password reset
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        // Find user with this email
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenExpiry = new Date();
        tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour
        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
        yield user.save();
        // Configure email transport
        const transporter = nodemailer_1.default.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your account.</p>
        <p>Please click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        };
        // Send email
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent' });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error during password reset request' });
    }
});
// Validate reset token
const validateResetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        if (!token) {
            res.status(400).json({ message: 'Token is required' });
            return;
        }
        // Find user with this token
        const user = yield user_model_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }, // Token has not expired
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        res.status(200).json({ message: 'Token is valid' });
    }
    catch (error) {
        console.error('Token validation error:', error);
        res.status(500).json({ message: 'Server error during token validation' });
    }
});
// Reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }
        // Find user with this token
        const user = yield user_model_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }, // Token has not expired
        });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        // Hash new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        res.status(200).json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});
const checkUserExists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required', exists: false });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
        // Check if user exists with this email (case insensitive)
        const existingUser = yield user_model_1.default.findOne({
            email: { $regex: new RegExp('^' + email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        });
        // Return whether the user exists
        res.status(200).json({
            exists: !!existingUser,
            userId: existingUser ? existingUser._id : undefined,
        });
    }
    catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ message: 'Server error', exists: false });
    }
});
exports.default = {
    register: exports.register,
    login,
    logout,
    refresh,
    socialLogin,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    checkUserExists,
};
//# sourceMappingURL=auth_controller.js.map