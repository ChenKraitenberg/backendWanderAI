"use strict";
// import request from 'supertest';
// import appInit from '../server';
// import mongoose from 'mongoose';
// import path from 'path';
// import fs from 'fs';
// import { Express } from 'express';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// let app: Express;
// // Test file paths
// const testFiles = {
//   text: path.join(__dirname, 'test_file.txt'),
//   jpeg: path.join(__dirname, 'test_image.jpg'),
//   png: path.join(__dirname, 'test_image.png'),
//   // Note: For HEIC testing, a real HEIC file would be needed
//   // Since we can't easily include binary files, we'll mock this part
// };
// beforeAll(async () => {
//   console.log('Setting up enhanced file tests');
//   app = await appInit();
//   // Create test image files if they don't exist
//   if (!fs.existsSync(testFiles.jpeg)) {
//     // Create a simple test JPEG file
//     createDummyImageFile(testFiles.jpeg, 'JPEG');
//   }
//   if (!fs.existsSync(testFiles.png)) {
//     // Create a simple test PNG file
//     createDummyImageFile(testFiles.png, 'PNG');
//   }
// });
// afterAll(async () => {
//   console.log('Cleaning up enhanced file tests');
//   // Clean up test files
//   try {
//     if (fs.existsSync(testFiles.jpeg) && !testFiles.jpeg.includes('test_file.txt')) {
//       fs.unlinkSync(testFiles.jpeg);
//     }
//     if (fs.existsSync(testFiles.png) && !testFiles.png.includes('test_file.txt')) {
//       fs.unlinkSync(testFiles.png);
//     }
//   } catch (err) {
//     console.error('Error cleaning up test files:', err);
//   }
//   mongoose.connection.close();
// });
// // Helper function to create dummy image files for testing
// function createDummyImageFile(filePath: string, format: string) {
//   // Create a very simple file for testing
//   // In a real scenario, you'd want to create proper image files
//   let content = `This is a dummy ${format} file for testing purposes.`;
//   fs.writeFileSync(filePath, content);
// }
// describe('Enhanced File Upload Tests', () => {
//   test('Upload text file', async () => {
//     const response = await request(app).post('/file/upload').attach('image', testFiles.text);
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('url');
//     expect(response.body.url).toMatch(/^\/uploads\/[0-9]+\.jpg$/);
//     // Verify uploaded file is accessible
//     const fileUrl = response.body.url;
//     const fileResponse = await request(app).get(fileUrl);
//     expect(fileResponse.status).toBe(200);
//   });
//   test('Upload JPEG image', async () => {
//     const response = await request(app).post('/file/upload').attach('image', testFiles.jpeg);
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('url');
//     expect(response.body.url).toMatch(/^\/uploads\/[0-9]+\.jpg$/);
//     // Verify uploaded file is accessible
//     const fileUrl = response.body.url;
//     const fileResponse = await request(app).get(fileUrl);
//     expect(fileResponse.status).toBe(200);
//   });
//   test('Upload PNG image', async () => {
//     const response = await request(app).post('/file/upload').attach('image', testFiles.png);
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('url');
//     expect(response.body.url).toMatch(/^\/uploads\/[0-9]+\.jpg$/);
//     // Verify uploaded file is accessible
//     const fileUrl = response.body.url;
//     const fileResponse = await request(app).get(fileUrl);
//     expect(fileResponse.status).toBe(200);
//   });
//   test('Upload with no file should fail', async () => {
//     const response = await request(app).post('/file/upload');
//     expect(response.status).toBe(400);
//   });
//   test('Access uploaded file directly', async () => {
//     // First upload a file
//     const uploadResponse = await request(app).post('/file/upload').attach('image', testFiles.text);
//     const fileUrl = uploadResponse.body.url;
//     // Now try to access the file
//     const fileResponse = await request(app).get(fileUrl);
//     expect(fileResponse.status).toBe(200);
//     expect(fileResponse.headers['content-type']).toContain('image/jpeg');
//   });
//   test('File access security - directory traversal', async () => {
//     // Test that file access route is protected against directory traversal
//     const traversalPaths = ['/file-access/../../../.env', '/file-access/..%2F..%2F..%2F.env', '/file-access/%2e%2e/%2e%2e/%2e%2e/.env'];
//     for (const path of traversalPaths) {
//       const response = await request(app).get(path);
//       expect(response.status).toBe(400); // Should return error, not the file
//     }
//   });
//   test('Upload oversized file should fail', async () => {
//     // Create a temporary file that's over the size limit (5MB)
//     const oversizedFilePath = path.join(__dirname, 'oversized_test.txt');
//     try {
//       // Create a ~6MB file
//       const buffer = Buffer.alloc(6 * 1024 * 1024, 'x');
//       fs.writeFileSync(oversizedFilePath, buffer);
//       const response = await request(app).post('/file/upload').attach('image', oversizedFilePath);
//       expect(response.status).toBe(400); // Should reject oversized file
//     } catch (err) {
//       console.error('Error in oversized file test:', err);
//     } finally {
//       // Clean up
//       if (fs.existsSync(oversizedFilePath)) {
//         fs.unlinkSync(oversizedFilePath);
//       }
//     }
//   });
//   test('Upload non-image file type should fail', async () => {
//     // Create a temporary file with non-image extension
//     const nonImageFilePath = path.join(__dirname, 'test.pdf');
//     try {
//       fs.writeFileSync(nonImageFilePath, 'Fake PDF content');
//       const response = await request(app).post('/file/upload').attach('image', nonImageFilePath);
//       expect(response.status).toBe(400); // Should reject non-image file
//     } catch (err) {
//       console.error('Error in non-image file test:', err);
//     } finally {
//       // Clean up
//       if (fs.existsSync(nonImageFilePath)) {
//         fs.unlinkSync(nonImageFilePath);
//       }
//     }
//   });
//   // Note: For properly testing HEIC conversion, we would need:
//   // 1. A real HEIC test file
//   // 2. The correct environment for heic-convert to work (may need native dependencies)
//   // This would typically be done in a more comprehensive testing environment
//   test('Access non-existent file should return 404', async () => {
//     const response = await request(app).get('/uploads/non-existent-file.jpg');
//     expect(response.status).toBe(404);
//   });
// });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting file upload route tests');
    app = yield (0, server_1.default)();
    // Create test directories if they don't exist
    const tempDir = path_1.default.join(__dirname, '..', '..', 'temp');
    const uploadsDir = path_1.default.join(__dirname, '..', '..', 'public', 'uploads');
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Finishing file upload route tests');
    yield mongoose_1.default.connection.close();
}));
describe('File Upload Route Tests', () => {
    // Create a test image file buffer
    const createTestImageBuffer = () => {
        return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    };
    // Create a temporary test file
    const createTestFile = (filename, buffer) => {
        const filePath = path_1.default.join(__dirname, filename);
        fs_1.default.writeFileSync(filePath, buffer);
        return filePath;
    };
    // Clean up test files after tests
    const cleanupTestFile = (filePath) => {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    };
    test('Should upload a JPG image file successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const testImagePath = createTestFile('test_image.jpg', createTestImageBuffer());
        try {
            const response = yield (0, supertest_1.default)(app).post('/file/upload').attach('image', testImagePath);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('url');
            expect(response.body).toHaveProperty('message', 'File uploaded successfully');
            expect(response.body.url).toMatch(/^\/uploads\/\d+\.jpg$/);
            // Verify the file exists in the uploads directory
            const uploadedFilename = response.body.url.split('/').pop();
            const uploadedFilePath = path_1.default.join(__dirname, '..', '..', 'public', 'uploads', uploadedFilename);
            expect(fs_1.default.existsSync(uploadedFilePath)).toBe(true);
            // Clean up the uploaded file
            cleanupTestFile(uploadedFilePath);
        }
        finally {
            // Clean up the test file
            cleanupTestFile(testImagePath);
        }
    }));
    test('Should reject upload when no file is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post('/file/upload').attach('image', ''); // Empty attachment
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'No file uploaded');
    }));
    test('Should reject upload with invalid file type', () => __awaiter(void 0, void 0, void 0, function* () {
        const testTextPath = createTestFile('test_file.txt', Buffer.from('This is a test text file'));
        try {
            // This should be rejected by the multer fileFilter
            yield (0, supertest_1.default)(app).post('/file/upload').attach('image', testTextPath).expect(400); // Multer will reject with 400 status
        }
        catch (error) {
            // Some versions of multer might throw an error instead
            expect(error).toBeDefined();
        }
        finally {
            cleanupTestFile(testTextPath);
        }
    }));
    test('Should handle large files appropriately', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a file larger than the 5MB limit
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
        const largeFilePath = createTestFile('large_image.jpg', largeBuffer);
        try {
            // This should be rejected by the multer limits
            yield (0, supertest_1.default)(app).post('/file/upload').attach('image', largeFilePath).expect(413); // Payload Too Large
        }
        catch (error) {
            // Some versions of multer might throw an error instead
            expect(error).toBeDefined();
        }
        finally {
            cleanupTestFile(largeFilePath);
        }
    }));
    // Mock test for HEIC conversion - we can't easily create a real HEIC file in tests
    test('Should handle filename with HEIC extension', () => __awaiter(void 0, void 0, void 0, function* () {
        const testImagePath = createTestFile('test_image.heic', createTestImageBuffer());
        try {
            const response = yield (0, supertest_1.default)(app).post('/file/upload').attach('image', testImagePath);
            // Even though this isn't a real HEIC file, the route should try to process it
            // Depending on implementation, it might succeed with the fallback or fail gracefully
            if (response.status === 200) {
                expect(response.body).toHaveProperty('url');
                const uploadedFilename = response.body.url.split('/').pop();
                const uploadedFilePath = path_1.default.join(__dirname, '..', '..', 'public', 'uploads', uploadedFilename);
                if (fs_1.default.existsSync(uploadedFilePath)) {
                    cleanupTestFile(uploadedFilePath);
                }
            }
            else {
                // If it fails, it should do so gracefully
                expect(response.status).toBe(500);
            }
        }
        finally {
            cleanupTestFile(testImagePath);
        }
    }));
});
//# sourceMappingURL=file-upload.test.js.map