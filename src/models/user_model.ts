import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  avatar?: string;
  name?: string; // אם את רוצה שם למשתמש
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
  },
});

const userModel = mongoose.model<IUser>('Users', userSchema);

export default userModel;
