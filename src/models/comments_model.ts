import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IComment {
  _id?: string;
  text: string;  // Changed from 'comment' to 'text' for consistency
  user: {        // Changed from 'owner' to 'user' object
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  postId: string;
  createdAt: Date;
};

const commentsSchema = new Schema<IComment>({
  text: {
    type: String,
    required: true,
  },
  user: {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: String,
    avatar: String,
  },
  postId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const commentModel = mongoose.model<IComment>("Comments", commentsSchema);

export default commentModel;
