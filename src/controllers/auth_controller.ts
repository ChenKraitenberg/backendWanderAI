// src/controllers/auth_controller.ts
import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import axios from 'axios';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const register = async (req: Request, res: Response): Promise<void> => {
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
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await userModel.create({
      email,
      password: hashedPassword,
      name, // Save the username
      avatar: avatar || null,
    });

    // Generate JWT token
    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.TOKEN_SECRET as string, { expiresIn: process.env.TOKEN_EXPIRE as string } as jwt.SignOptions);

    // Return response
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).send('Something went wrong in register process.');
  }
};

const generateTokens = (user: IUser): { accessToken: string; refreshToken: string } | null => {
  if (!process.env.TOKEN_SECRET) {
    return null;
  }
  const random = Math.random().toString();
  const accessToken = jwt.sign({ _id: user._id, email: user.email }, process.env.TOKEN_SECRET as string, { expiresIn: process.env.TOKEN_EXPIRE as string } as jwt.SignOptions);

  const refreshToken = jwt.sign({ _id: user._id, email: user.email }, process.env.TOKEN_SECRET as string, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE as string } as jwt.SignOptions);

  if (user.refreshToken == null) {
    user.refreshToken = [];
  }
  user.refreshToken.push(refreshToken);
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  try {
    // Verify user & password
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).send('Wrong email or password');
      return;
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
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
    await user.save();

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
  } catch (err) {
    res.status(400).send('Wrong email or password');
  }
};

type UserDocument = Document<unknown, {}, IUser> &
  IUser &
  Required<{
    _id: string;
  }> & {
    __v: number;
  };

const verifyAccessToken = (refreshToken: string | undefined) => {
  return new Promise<UserDocument>((resolve, reject) => {
    if (!refreshToken) {
      reject('Access Denied');
      return;
    }
    if (!process.env.TOKEN_SECRET) {
      reject('Server Error');
      return;
    }
    jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
      if (err) {
        reject('Access Denied');
        return;
      }
      const userId = payload._id;
      try {
        const user = await userModel.findById(userId);
        if (!user) {
          reject('Access Denied');
          return;
        }
        if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
          user.refreshToken = [];
          await user.save();
          reject('Access Denied');
          return;
        }
        user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
        resolve(user);
      } catch (err) {
        reject('Access Denied');
        return;
      }
    });
  });
};

const logout = async (req: Request, res: Response) => {
  try {
    const user = await verifyAccessToken(req.body.refreshToken);
    await user.save();
    res.status(200).send('Logged out');
  } catch (err) {
    res.status(400).send('Access Denied');
    return;
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const user = await verifyAccessToken(req.body.refreshToken);

    // Generate new tokens
    const tokens = generateTokens(user);
    await user.save();

    if (!tokens) {
      res.status(400).send('Access Denied');
      return;
    }

    // Send response
    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(400).send('Access Denied');
    return;
  }
};

type Payload = {
  _id: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const token = authorization && authorization.split(' ')[1];
  if (!token) {
    res.status(401).send('Access Denied');
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(400).send('Server Error');
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
    if (err) {
      console.error('JWT Error:', err);
      res.status(401).send('Access Denied');
      return;
    }
    console.log('JWT Payload:', payload);
    const userId = (payload as Payload)._id;
    req.params.userId = userId;
    next();
  });
};

const socialLogin = async (req: Request, res: Response) => {
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
        const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
        const googleData = googleResponse.data as { email: string };
        socialEmail = googleData.email;
        console.log('Verified Google token for email:', socialEmail);

        if (!socialEmail) {
          console.log('Invalid Google token - no email returned');
          res.status(400).json({ message: 'Invalid Google token' });
          return;
        }
      } else {
        console.log('Invalid provider:', provider);
        res.status(400).json({ message: 'Invalid provider' });
        return;
      }
    } catch (error) {
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
    let user = await userModel.findOne({
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

      // Update social provider if it wasn't set before
      if (!user.socialProvider) {
        console.log('Setting social provider to', provider);
        user.socialProvider = provider;
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log('Saving updated user information');
        try {
          await user.save();
          console.log('User updated successfully');
        } catch (saveError) {
          console.error('Error updating user:', saveError);
        }
      }
    } else {
      // No existing user found, create a new one
      console.log('No existing user found with email', emailToUse, '- creating new user');
      const randomPassword = crypto.randomBytes(20).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await userModel.create({
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
    await user.save();

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
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Server error during social login' });
  }
};

// Request password reset
const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user with this email
    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    // Configure email transport
    const transporter = nodemailer.createTransport({
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
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

// Validate reset token
const validateResetToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }

    // Find user with this token
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token has not expired
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Server error during token validation' });
  }
};

// Reset password
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    // Find user with this token
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token has not expired
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

const checkUserExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required', exists: false });
      return;
    }

    // Check if user exists with this email
    const existingUser = await userModel.findOne({ email });

    // Return whether the user exists and their ID if they do
    // The ID can be used for additional checks or account linking
    res.status(200).json({
      exists: !!existingUser,
      userId: existingUser ? existingUser._id : undefined,
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({ message: 'Server error', exists: false });
  }
};

export default {
  register,
  login,
  logout,
  refresh,
  socialLogin,
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  checkUserExists,
};
