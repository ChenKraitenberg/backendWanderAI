import mongoose from 'mongoose';
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
  createdAt: Date;
  updatedAt: Date;
  likes: string[];
  comments: string[];
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
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  likes: {
    type: [String],
    default: [],
  },
  comments: {
    type: [String],
    required: true,
    default: [],
  },
});

// לדאוג שבכל שמירה יתעדכן updatedAt
PostSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const PostModel = mongoose.model<IPost>('Post', PostSchema);
export default PostModel;
