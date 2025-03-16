// src/models/user_model.ts
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  avatar?: string;
  name: string;
  socialProvider?: 'google' | null;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
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

const userModel = mongoose.model<IUser>('Users', userSchema);

export default userModel;
