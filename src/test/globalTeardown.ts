// globalTeardown.ts
import mongoose from 'mongoose';

export default async function () {
  // Ensure the connection is active before trying to drop the database.
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
}
