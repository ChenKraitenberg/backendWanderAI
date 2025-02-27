// src/routes/trip_routes.ts
import express, { Request, Response } from 'express';
import { authMiddleware } from '../controllers/auth_controller';
import tripController from '../controllers/trips_controller';
import TripModel from '../models/trips_model';

const router = express.Router();

// כל הנתיבים מוגנים עם auth
//router.use(authMiddleware);

// CRUD endpoints
router.get('/', tripController.getAll.bind(tripController));
router.get('/user', tripController.getByUser.bind(tripController));
//router.get('/:id', tripController.getById.bind(tripController));
//router.post('/', authMiddleware, tripController.create.bind(tripController));
// trips_router.ts
router.post('/', async (req, res) => {
  try {
    console.log('Received trip data:', req.body);
    const trip = new TripModel(req.body);
    const savedTrip = await trip.save();
    res.status(201).json(savedTrip);
  } catch (error: any) {
    console.error('Error saving trip:', {
      message: error.message,
      errors: error.errors,
    });
    res.status(400).json({
      message: error.message,
      errors: error.errors,
    });
  }
});
router.put('/:id', authMiddleware, tripController.update.bind(tripController));
router.delete('/:id', authMiddleware, tripController.deleteItem.bind(tripController));

export default router;
