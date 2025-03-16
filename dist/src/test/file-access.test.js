"use strict";
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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting file access route tests');
    app = yield (0, server_1.default)();
    // Create uploads directory if it doesn't exist
    // Use the same path resolution as your file-access-route.ts
    const uploadsDir = path_1.default.join(process.cwd(), 'public', 'uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    console.log(`Uploads directory path: ${uploadsDir}`);
    console.log(`Uploads directory exists: ${fs_1.default.existsSync(uploadsDir)}`);
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Finishing file access route tests');
    yield mongoose_1.default.connection.close();
}));
describe('File Access Route Tests', () => {
    // Helper to create a test file in the uploads directory
    // Uses the same path resolution as your file-access-route.ts
    const createTestFile = (filename, content = 'test content') => {
        const uploadsDir = path_1.default.join(process.cwd(), 'public', 'uploads');
        const filePath = path_1.default.join(uploadsDir, filename);
        console.log(`Creating test file at: ${filePath}`);
        try {
            fs_1.default.writeFileSync(filePath, content);
            console.log(`File created successfully: ${fs_1.default.existsSync(filePath)}`);
        }
        catch (error) {
            console.error(`Error creating file: ${error instanceof Error ? error.message : String(error)}`);
        }
        return filePath;
    };
    // Helper to cleanup test files
    const cleanupTestFile = (filePath) => {
        if (fs_1.default.existsSync(filePath)) {
            console.log(`Deleting file: ${filePath}`);
            try {
                fs_1.default.unlinkSync(filePath);
                console.log(`File deleted successfully`);
            }
            catch (error) {
                console.error(`Error deleting file: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        else {
            console.log(`File not found for deletion: ${filePath}`);
        }
    };
    test('Should serve an existing file', () => __awaiter(void 0, void 0, void 0, function* () {
        const testFilename = 'test-file.txt';
        const testContent = 'This is a test file content';
        const testFilePath = createTestFile(testFilename, testContent);
        try {
            // Wait a moment to ensure file system has completed the write
            yield new Promise((resolve) => setTimeout(resolve, 100));
            console.log(`Before request, file exists: ${fs_1.default.existsSync(testFilePath)}`);
            const response = yield (0, supertest_1.default)(app).get(`/file-access/${testFilename}`);
            console.log(`Response status: ${response.status}`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(testContent);
            expect(response.header['content-type']).toContain('text/plain');
        }
        finally {
            cleanupTestFile(testFilePath);
        }
    }));
    test('Should return 404 for non-existent file', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/file-access/non-existent-file.jpg');
        expect(response.status).toBe(404);
        expect(response.text).toBe('File not found');
    }));
    test('Should reject filenames with directory traversal attempts', () => __awaiter(void 0, void 0, void 0, function* () {
        // Test with different directory traversal patterns
        const traversalPaths = ['../config.json', '..\\secret.txt', 'subfolder/../private.key', '%2e%2e/etc/passwd', 'normal/slash/file.txt', 'file\\with\\backslashes.jpg'];
        for (const testPath of traversalPaths) {
            console.log(`Testing traversal path: ${testPath}`);
            const response = yield (0, supertest_1.default)(app).get(`/file-access/${testPath}`);
            console.log(`Traversal response status: ${response.status}`);
            // Accept either 400 (Invalid filename) or 404 (File not found)
            // Both responses indicate the file access was prevented
            expect([400, 404]).toContain(response.status);
            if (response.status === 400) {
                expect(response.text).toBe('Invalid filename');
            }
            else if (response.status === 404) {
                // Express might return HTML error pages or custom messages
                // Just check that we don't get a successful response
                expect(response.status).not.toBe(200);
            }
        }
    }));
    test('Should serve image files with correct content type', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a simple 1x1 pixel JPEG
        const jpegBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==', 'base64');
        const testFilename = 'test-image.jpg';
        const testFilePath = createTestFile(testFilename, jpegBuffer.toString());
        try {
            // Wait a moment to ensure file system has completed the write
            yield new Promise((resolve) => setTimeout(resolve, 100));
            console.log(`Before request, image file exists: ${fs_1.default.existsSync(testFilePath)}`);
            const response = yield (0, supertest_1.default)(app).get(`/file-access/${testFilename}`);
            console.log(`Image response status: ${response.status}`);
            expect(response.status).toBe(200);
            expect(response.header['content-type']).toContain('image/jpeg');
        }
        finally {
            cleanupTestFile(testFilePath);
        }
    }));
    test('Should validate response when file is successfully sent', () => __awaiter(void 0, void 0, void 0, function* () {
        const testFilename = 'successful-send.txt';
        const testContent = 'Content for successful send test';
        const testFilePath = createTestFile(testFilename, testContent);
        try {
            // Wait a moment to ensure file system has completed the write
            yield new Promise((resolve) => setTimeout(resolve, 100));
            const response = yield (0, supertest_1.default)(app).get(`/file-access/${testFilename}`);
            expect(response.status).toBe(200);
            expect(response.text).toBe(testContent);
        }
        finally {
            cleanupTestFile(testFilePath);
        }
    }));
    test('Should handle multiple concurrent requests for the same file', () => __awaiter(void 0, void 0, void 0, function* () {
        const testFilename = 'concurrent-test.txt';
        const testContent = 'This file will be accessed concurrently';
        const testFilePath = createTestFile(testFilename, testContent);
        try {
            // Wait a moment to ensure file system has completed the write
            yield new Promise((resolve) => setTimeout(resolve, 100));
            // Send multiple concurrent requests
            const requests = [];
            for (let i = 0; i < 5; i++) {
                requests.push((0, supertest_1.default)(app).get(`/file-access/${testFilename}`));
            }
            const responses = yield Promise.all(requests);
            // All requests should succeed
            for (const response of responses) {
                expect(response.status).toBe(200);
                expect(response.text).toBe(testContent);
            }
        }
        finally {
            cleanupTestFile(testFilePath);
        }
    }));
});
//# sourceMappingURL=file-access.test.js.map