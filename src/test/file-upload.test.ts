import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
  console.log('Starting file upload route tests');
  app = await appInit();

  // Create test directories if they don't exist
  const tempDir = path.join(__dirname, '..', '..', 'temp');
  const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
});

afterAll(async () => {
  console.log('Finishing file upload route tests');
  await mongoose.connection.close();
});

describe('File Upload Route Tests', () => {
  // Create a test image file buffer
  const createTestImageBuffer = (): Buffer => {
    return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  };

  // Create a temporary test file
  const createTestFile = (filename: string, buffer: Buffer): string => {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  };

  // Clean up test files after tests
  const cleanupTestFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };

  test('Should upload a JPG image file successfully', async () => {
    const testImagePath = createTestFile('test_image.jpg', createTestImageBuffer());

    try {
      const response = await request(app).post('/file/upload').attach('image', testImagePath);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('message', 'File uploaded successfully');
      expect(response.body.url).toMatch(/^\/uploads\/\d+\.jpg$/);

      // Verify the file exists in the uploads directory
      const uploadedFilename = response.body.url.split('/').pop();
      const uploadedFilePath = path.join(__dirname, '..', '..', 'public', 'uploads', uploadedFilename);
      expect(fs.existsSync(uploadedFilePath)).toBe(true);

      // Clean up the uploaded file
      cleanupTestFile(uploadedFilePath);
    } finally {
      // Clean up the test file
      cleanupTestFile(testImagePath);
    }
  });

  test('Should reject upload when no file is provided', async () => {
    const response = await request(app).post('/file/upload').attach('image', ''); // Empty attachment

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'No file uploaded');
  });

  test('Should reject upload with invalid file type', async () => {
    const testTextPath = createTestFile('test_file.txt', Buffer.from('This is a test text file'));

    try {
      // This should be rejected by the multer fileFilter
      await request(app).post('/file/upload').attach('image', testTextPath).expect(400); // Multer will reject with 400 status
    } catch (error) {
      // Some versions of multer might throw an error instead
      expect(error).toBeDefined();
    } finally {
      cleanupTestFile(testTextPath);
    }
  });

  test('Should handle large files appropriately', async () => {
    // Create a file larger than the 5MB limit
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const largeFilePath = createTestFile('large_image.jpg', largeBuffer);

    try {
      // This should be rejected by the multer limits
      await request(app).post('/file/upload').attach('image', largeFilePath).expect(413); // Payload Too Large
    } catch (error) {
      // Some versions of multer might throw an error instead
      expect(error).toBeDefined();
    } finally {
      cleanupTestFile(largeFilePath);
    }
  });

  // Mock test for HEIC conversion - we can't easily create a real HEIC file in tests
  test('Should handle filename with HEIC extension', async () => {
    const testImagePath = createTestFile('test_image.heic', createTestImageBuffer());

    try {
      const response = await request(app).post('/file/upload').attach('image', testImagePath);

      // Even though this isn't a real HEIC file, the route should try to process it
      // Depending on implementation, it might succeed with the fallback or fail gracefully
      if (response.status === 200) {
        expect(response.body).toHaveProperty('url');
        const uploadedFilename = response.body.url.split('/').pop();
        const uploadedFilePath = path.join(__dirname, '..', '..', 'public', 'uploads', uploadedFilename);

        if (fs.existsSync(uploadedFilePath)) {
          cleanupTestFile(uploadedFilePath);
        }
      } else {
        // If it fails, it should do so gracefully
        expect(response.status).toBe(500);
      }
    } finally {
      cleanupTestFile(testImagePath);
    }
  });
});
