// src/models/wishlist_model.ts
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IWishlistItem extends mongoose.Document {
  title: string;
  description: string;
  destination: string;
  duration: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  itinerary?: string[];
  userId: string;
  createdAt: Date;
  image?: string;
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['RELAXED', 'MODERATE', 'INTENSIVE'],
    required: true,
  },
  itinerary: {
    type: [String],
  },
  userId: {
    type: Schema.Types.String,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
  }
});

const WishlistModel = mongoose.model<IWishlistItem>('Wishlist', WishlistItemSchema);
export default WishlistModel;