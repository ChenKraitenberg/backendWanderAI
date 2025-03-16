import mongoose from 'mongoose';
import initApp from '../server';
import userModel from '../models/user_model';
import postModel from '../models/posts_model';

describe('Database Connection Tests', () => {
  beforeAll(async () => {
    await initApp();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should successfully connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });

  it('should be able to perform a basic database operation', async () => {
    // Create a test user
    const testUser = {
      email: 'db.test@example.com',
      password: 'hashedpassword',
      name: 'DB Test User',
    };

    // Clean up any existing test data
    await userModel.deleteMany({ email: 'db.test@example.com' });

    // Create the user
    const createdUser = await userModel.create(testUser);
    expect(createdUser).toBeDefined();
    expect(createdUser.email).toBe('db.test@example.com');

    // Retrieve the user
    const foundUser = await userModel.findOne({ email: 'db.test@example.com' });
    expect(foundUser).toBeDefined();
    expect(foundUser!.name).toBe('DB Test User');

    // Clean up
    await userModel.deleteMany({ email: 'db.test@example.com' });
  });

  it('should handle concurrent database operations', async () => {
    // Clean up any previous test data
    await userModel.deleteMany({ email: /^concurrent/ });
    await postModel.deleteMany({ name: /^Concurrent Test Post/ });

    // Create a test user
    const user = await userModel.create({
      email: 'concurrent.test@example.com',
      password: 'hashedpassword',
      name: 'Concurrent Test User',
    });

    // Prepare multiple concurrent operations
    const operations = Array(5)
      .fill(null)
      .map((_, i) => {
        return postModel.create({
          name: `Concurrent Test Post ${i}`,
          description: `Test description ${i}`,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000), // Tomorrow
          price: 1000 + i,
          maxSeats: 10,
          bookedSeats: 0,
          image: 'test.jpg',
          destination: 'Test Location',
          category: 'RELAXED',
          userId: user._id,
          owner: user._id,
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
          },
        });
      });

    // Execute all operations concurrently
    const results = await Promise.all(operations);
    expect(results.length).toBe(5);

    // Verify all posts were created
    const count = await postModel.countDocuments({ name: /^Concurrent Test Post/ });
    expect(count).toBe(5);

    // Clean up
    await userModel.deleteMany({ email: /^concurrent/ });
    await postModel.deleteMany({ name: /^Concurrent Test Post/ });
  });

  it('should handle database errors gracefully', async () => {
    // Test duplicate key error handling
    await userModel.deleteMany({ email: 'duplicate@example.com' });

    // Create first user
    await userModel.create({
      email: 'duplicate@example.com',
      password: 'hashedpassword',
      name: 'Original User',
    });

    // Try to create duplicate user
    try {
      await userModel.create({
        email: 'duplicate@example.com',
        password: 'anotherpassword',
        name: 'Duplicate User',
      });
      // Should not reach here
      throw new Error('Expected duplicate key error');
    } catch (error: any) {
      // Should be a duplicate key error
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
      expect(error.keyPattern).toHaveProperty('email');
    }

    // Clean up
    await userModel.deleteMany({ email: 'duplicate@example.com' });
  });
});
