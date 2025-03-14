import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IComment extends mongoose.Document {
  text: string;
  postId: string;
  createdAt: Date;
  user: {
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

const CommentSchema = new Schema<IComment>({
  text: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  postId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
});

const CommentModel = mongoose.model<IComment>('Comment', CommentSchema);
export default CommentModel;
