import mongoose, { Schema } from 'mongoose';

export interface ITrip extends mongoose.Document {
  title: string;
  description: string;
  itinerary: string[];
  destination: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  imageUrl: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  itinerary: [
    {
      type: String,
      required: true,
    },
  ],
  destination: {
    type: String,
    required: true,
  },
  duration: {
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
    default: 0,
  },
  maxParticipants: {
    type: Number,
    required: true,
    default: 10,
  },
  currentParticipants: {
    type: Number,
    required: true,
    default: 0,
  },
  imageUrl: {
    type: String,
    required: true,
    default: 'https://via.placeholder.com/800x400',
  },
  category: {
    type: String,
    enum: ['RELAXED', 'MODERATE', 'INTENSIVE'],
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const TripModel = mongoose.model<ITrip>('Trip', tripSchema);
export default TripModel;
