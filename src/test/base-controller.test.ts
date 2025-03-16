// src/test/base-controller.test.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import BaseController from '../controllers/base_controller';

// Create a test schema and model
const testSchema = new mongoose.Schema({
  name: String,
  description: String,
  userId: String,
  owner: String,
});

const TestModel = mongoose.model('TestItem', testSchema);
const testController = new BaseController(TestModel);

// Mock request and response objects
const mockRequest = (data: any = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
  } as Request;
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('BaseController Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/test_db');
  });

  afterAll(async () => {
    // Clean up and close connection
    await TestModel.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test collection before each test
    await TestModel.deleteMany({});
  });

  describe('getAll method', () => {
    test('should return all items when no filter is provided', async () => {
      // Create test items
      await TestModel.create([
        { name: 'Item 1', userId: 'user1', owner: 'owner1' },
        { name: 'Item 2', userId: 'user2', owner: 'owner2' },
      ]);

      const req = mockRequest();
      const res = mockResponse();

      await testController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'Item 1' }), expect.objectContaining({ name: 'Item 2' })]));
    });

    test('should filter items by userId', async () => {
      // Create test items
      await TestModel.create([
        { name: 'Item 1', userId: 'user1', owner: 'owner1' },
        { name: 'Item 2', userId: 'user2', owner: 'owner2' },
      ]);

      const req = mockRequest({ query: { userId: 'user1' } });
      const res = mockResponse();

      await testController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'Item 1', userId: 'user1' })]));
    });

    test('should filter items by owner', async () => {
      // Create test items
      await TestModel.create([
        { name: 'Item 1', userId: 'user1', owner: 'owner1' },
        { name: 'Item 2', userId: 'user2', owner: 'owner2' },
      ]);

      const req = mockRequest({ query: { owner: 'owner2' } });
      const res = mockResponse();

      await testController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'Item 2', owner: 'owner2' })]));
    });

    test('should handle errors gracefully', async () => {
      // Mock a failure in find()
      jest.spyOn(TestModel, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const req = mockRequest();
      const res = mockResponse();

      await testController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // Similar test blocks for getById, create, update, and deleteItem methods
  // ...

  describe('getById method', () => {
    test('should return item when found', async () => {
      const item = await TestModel.create({ name: 'Test Item' });

      const req = mockRequest({ params: { id: item._id.toString() } });
      const res = mockResponse();

      await testController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Item' }));
    });

    test('should return 404 when item not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const req = mockRequest({ params: { id: nonExistentId } });
      const res = mockResponse();

      await testController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('not found');
    });
  });

  describe('create method', () => {
    test('should create and return new item', async () => {
      const newItem = { name: 'New Item', description: 'New Description' };

      const req = mockRequest({ body: newItem });
      const res = mockResponse();

      await testController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining(newItem));
    });
  });

  describe('update method', () => {
    test('should update and return item', async () => {
      const item = await TestModel.create({ name: 'Original Name' });
      const updateData = { name: 'Updated Name' };

      const req = mockRequest({
        params: { id: item._id.toString() },
        body: updateData,
      });
      const res = mockResponse();

      await testController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining(updateData));
    });
  });

  describe('deleteItem method', () => {
    test('should delete item successfully', async () => {
      const item = await TestModel.create({ name: 'Item to Delete' });

      const req = mockRequest({ params: { id: item._id.toString() } });
      const res = mockResponse();

      await testController.deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      // Verify item was deleted
      const deleted = await TestModel.findById(item._id);
      expect(deleted).toBeNull();
    });
  });
});
