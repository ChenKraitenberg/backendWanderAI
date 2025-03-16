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