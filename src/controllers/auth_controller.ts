// auth_controller.ts
import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';

// const register = async (req: Request, res: Response) => {
//   try {

//     const password = req.body.password;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     if (!req.body.avatar) req.body.avatar = null;

//     const user = await userModel.create({
//       email: req.body.email,
//       password: hashedPassword,
//       avatar: req.body.avatar,
//     });

//     // יצירת טוקן JWT
//     const token = jwt.sign(
//       { _id: user._id, email: user.email },
//       process.env.TOKEN_SECRET as string,
//       { expiresIn: process.env.TOKEN_EXPIRE } // תוקף הטוקן מתוך משתני הסביבה
//     );

//     // החזרת תגובה עם הטוקן והמשתמש
//     res.status(200).send({
//       token,
//       user,
//     });
//   } catch (err) {
//     res.status(400).send('wrong email or password');
//   }
// };
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, avatar } = req.body;

    // 1. בדיקה אם המשתמש כבר קיים במסד הנתונים
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // 2. הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. יצירת משתמש חדש
    const user = await userModel.create({
      email,
      password: hashedPassword,
      avatar: avatar || null,
    });

    // 4. יצירת טוקן JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.TOKEN_SECRET as string,
      { expiresIn: process.env.TOKEN_EXPIRE } // תוקף הטוקן מתוך משתני הסביבה
    );

    // 5. החזרת תשובה ללקוח
    res.status(200).json({ token, user });
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
  const accessToken = jwt.sign(
    {
      _id: user._id,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRE }
  );

  const refreshToken = jwt.sign(
    {
      _id: user._id,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
  );

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
    //verify user & password
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).send('wrong email or password');
      return;
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      res.status(400).send('wrong email or password');
      return;
    }
    //generate tokens
    const tokens = generateTokens(user);
    if (!tokens) {
      res.status(400).send('Access Denied');
      return;
    }
    await user.save();
    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
    });
  } catch (err) {
    res.status(400).send('wrong email or password');
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

    //generate new tokens
    const tokens = generateTokens(user);
    await user.save();

    if (!tokens) {
      res.status(400).send('Access Denied');
      return;
    }
    //send response
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

export default {
  register,
  login,
  logout,
  refresh,
};
