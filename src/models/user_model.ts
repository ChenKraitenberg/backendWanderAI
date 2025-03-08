// src/models/user_model.ts
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  avatar?: string;
  name: string; // Changed from optional to required
  socialProvider?: 'google' | 'facebook' | null;
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
    required: true, // Name is now required
  },
  socialProvider: {
    type: String,
    enum: ['google', 'facebook', null],
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
