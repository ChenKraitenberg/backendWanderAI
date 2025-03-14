import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Express } from 'express';

let app: Express;

beforeAll(async () => {
  console.log('Starting file access route tests');
  app = await appInit();

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
});

afterAll(async () => {
  console.log('Finishing file access route tests');
  await mongoose.connection.close();
});

describe('File Access Route Tests', () => {
  // Helper to create a test file in the uploads directory
  const createTestFile = (filename: string, content: string = 'test content'): string => {
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  };

  // Helper to cleanup test files
  const cleanupTestFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };

  test('Should serve an existing file', async () => {
    const testFilename = 'test-file.txt';
    const testContent = 'This is a test file content';
    const testFilePath = createTestFile(testFilename, testContent);

    try {
      const response = await request(app).get(`/file-access/${testFilename}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe(testContent);
      expect(response.header['content-type']).toContain('text/plain');
    } finally {
      cleanupTestFile(testFilePath);
    }
  });

  test('Should return 404 for non-existent file', async () => {
    const response = await request(app).get('/file-access/non-existent-file.jpg');

    expect(response.status).toBe(404);
    expect(response.text).toBe('File not found');
  });

  test('Should reject filenames with directory traversal attempts', async () => {
    // Test with different directory traversal patterns
    const traversalPaths = ['../config.json', '..\\secret.txt', 'subfolder/../private.key', '%2e%2e/etc/passwd', 'normal/slash/file.txt', 'file\\with\\backslashes.jpg'];

    for (const path of traversalPaths) {
      const response = await request(app).get(`/file-access/${path}`);

      // Verify that the response is either:
      // - 400 (Invalid filename)
      // - 404 (File not found or route not found)
      expect([400, 404]).toContain(response.status);

      if (response.status === 400) {
        expect(response.text).toBe('Invalid filename');
      } else if (response.status === 404) {
        // Some servers might respond with HTML error pages for 404s
        // We just need to verify it's not returning the actual file content
        // and that access is being blocked

        // For paths that should be caught by the traversal check,
        // we just verify the status code is correct
        expect(response.status).toBe(404);
      }
    }
  });

  test('Should serve image files with correct content type', async () => {
    // Create a simple 1x1 pixel JPEG
    const jpegBuffer = Buffer.from(
      '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==',
      'base64'
    );

    const testFilename = 'test-image.jpg';
    const testFilePath = createTestFile(testFilename, jpegBuffer.toString());

    try {
      const response = await request(app).get(`/file-access/${testFilename}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('image/jpeg');
    } finally {
      cleanupTestFile(testFilePath);
    }
  });

  test('Should validate response when file is successfully sent', async () => {
    const testFilename = 'successful-send.txt';
    const testContent = 'Content for successful send test';
    const testFilePath = createTestFile(testFilename, testContent);

    try {
      // Mock implementation to verify res.sendFile was called correctly
      const response = await request(app).get(`/file-access/${testFilename}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe(testContent);
    } finally {
      cleanupTestFile(testFilePath);
    }
  });

  test('Should handle multiple concurrent requests for the same file', async () => {
    const testFilename = 'concurrent-test.txt';
    const testContent = 'This file will be accessed concurrently';
    const testFilePath = createTestFile(testFilename, testContent);

    try {
      // Send multiple concurrent requests
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get(`/file-access/${testFilename}`));
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
      for (const response of responses) {
        expect(response.status).toBe(200);
        expect(response.text).toBe(testContent);
      }
    } finally {
      cleanupTestFile(testFilePath);
    }
  });
});
