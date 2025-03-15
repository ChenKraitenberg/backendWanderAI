// src/models/posts_model.ts
import mongoose from 'mongoose';
import { IComment } from './comments_model';
const Schema = mongoose.Schema;

export interface IPost extends mongoose.Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  price: number;
  maxSeats: number;
  bookedSeats: number;
  image: string;
  destination: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  createdAt: Date;
  updatedAt: Date;
  likes: string[];
  comments: IComment[];
  owner: string;
  userId: string;
  user: {
    _id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

const PostSchema = new Schema<IPost>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  maxSeats: {
    type: Number,
    required: true,
  },
  bookedSeats: {
    type: Number,
    //required: true,
  },
  image: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['RELAXED', 'MODERATE', 'INTENSIVE'],
    default: 'RELAXED',
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  likes: {
    type: [String],
    default: [],
  },
  comments: [
    {
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
      text: {
        type: String,
        required: true,
      },
      postId: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  owner: {
    type: Schema.Types.String,
    ref: 'User',
    required: true,
  },
  userId: {
    type: Schema.Types.String,
    ref: 'User',
    required: true,
  },
  // Store user info directly in the post for easy display
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
      required: true,
    },
    avatar: {
      type: String,
    },
  },
});

// Update the updatedAt field on every save
PostSchema.pre<IPost>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const PostModel = mongoose.model<IPost>('Post', PostSchema);
export default PostModel;
