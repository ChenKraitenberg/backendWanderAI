// src/controllers/base_controller.ts
import e, { Request, Response } from 'express';
import { Model } from 'mongoose';

class BaseController<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    try {
      // Check for userId or owner filter in query parameters
      const userId = req.query.userId as string;
      const owner = req.query.owner as string;

      // Log what we're filtering by
      console.log('Filtering posts by:', { userId, owner });

      if (userId) {
        // Filter by userId field
        const items = await this.model.find({ userId: userId });
        console.log(`Found ${items.length} items with userId: ${userId}`);
        res.status(200).send(items);
      } else if (owner) {
        // Filter by owner field
        const items = await this.model.find({ owner: owner });
        console.log(`Found ${items.length} items with owner: ${owner}`);
        res.status(200).send(items);
      } else {
        // No filter, return all items
        const items = await this.model.find();
        console.log(`Found ${items.length} items total`);
        res.status(200).send(items);
      }
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(400).send(error);
    }
  }

  async getById(req: Request, res: Response) {
    const itemId = req.params.id;
    try {
      const item = await this.model.findById(itemId);
      if (item === null) {
        return res.status(404).send('not found');
      } else {
        return res.status(200).send(item);
      }
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async create(req: Request, res: Response) {
    const item = req.body;

    // Log what we're creating
    console.log('Creating new item:', item);

    try {
      const newItem = await this.model.create(item);
      console.log('Created item:', newItem);
      res.status(201).send(newItem);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(400).send(error);
    }
  }

  async deleteItem(req: Request, res: Response) {
    const itemId = req.params.id;
    console.log(`Deleting item with ID: ${itemId}`);
    try {
      await this.model.findByIdAndDelete(itemId);
      res.status(200).send();
    } catch (error) {
      res.status(400).send(error);
    }
  }

  async update(req: Request, res: Response) {
    const item = req.body;
    const itemId = req.params.id;
    try {
      const updatedItem = await this.model.findByIdAndUpdate(itemId, item, { new: true });
      res.status(200).send(updatedItem);
    } catch (error) {
      res.status(400).send(error);
    }
  }
}

export default BaseController;
