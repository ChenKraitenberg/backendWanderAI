// src/controllers/trip_controller.ts
import { Request, Response } from 'express';
import BaseController from './base_controller';
import TripModel, { ITrip } from '../models/trips_model';

class TripController extends BaseController<ITrip> {
  constructor() {
    super(TripModel);
  }

  // Override create to include userId
  // async create(req: Request, res: Response) {
  //   try {
  //     const tripData = {
  //       ...req.body,
  //       userId: req.params.userId, // מגיע מה-auth middleware
  //     };
  //     const newTrip = await this.model.create(tripData);
  //     res.status(201).send(newTrip);
  //   } catch (error) {
  //     console.error('Error creating trip:', error);
  //     res.status(400).send(error);
  //   }
  // }
  async createTrip(req: Request, res: Response) {
    try {
      const tripData = req.body;

      // השלמת ערכים חסרים
      const completeTrip = {
        title: tripData.title || 'טיול חדש',
        preferences: {
          ...tripData.preferences,
          style: tripData.preferences?.style || 'balanced',
        },
      };

      const newTrip = await this.model.create(completeTrip);
      res.status(201).send(newTrip);
    } catch (error) {
      console.error('Error creating trip:', error);
      res.status(400).send(error);
    }
  }

  // Override getAll to get only user's trips
  async getAll(req: Request, res: Response) {
    try {
      const trips = await this.model.find({ userId: req.params.userId }).sort({ createdAt: -1 });
      res.status(200).send(trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      res.status(400).send(error);
    }
  }

  // Override delete to check ownership
  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const trip = await this.model.findOne({
        _id: req.params.id,
        userId: req.params.userId,
      });

      if (!trip) {
        res.status(404).send('Trip not found or unauthorized');
        return;
      }

      await trip.deleteOne();
      res.status(200).send();
    } catch (error) {
      console.error('Error deleting trip:', error);
      res.status(400).send(error);
    }
  }

  // Override update to check ownership
  async update(req: Request, res: Response) {
    try {
      const trip = await this.model.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.params.userId,
        },
        req.body,
        { new: true }
      );

      if (!trip) {
        res.status(404).send('Trip not found or unauthorized');
      }

      res.status(200).send(trip);
    } catch (error) {
      console.error('Error updating trip:', error);
      res.status(400).send(error);
    }
  }

  async getByUser(req: Request, res: Response) {
    try {
      const trips = await this.model.find({ userId: req.params.userId });
      res.status(200).send(trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      res.status(400).send(error);
    }
  }
}

export default new TripController();
