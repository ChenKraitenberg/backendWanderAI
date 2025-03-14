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
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../server"));
const user_model_1 = __importDefault(require("../models/user_model"));
const posts_model_1 = __importDefault(require("../models/posts_model"));
describe('Database Connection Tests', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, server_1.default)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
    }));
    it('should successfully connect to MongoDB', () => {
        expect(mongoose_1.default.connection.readyState).toBe(1); // 1 means connected
    });
    it('should be able to perform a basic database operation', () => __awaiter(void 0, void 0, void 0, function* () {
        // Create a test user
        const testUser = {
            email: 'db.test@example.com',
            password: 'hashedpassword',
            name: 'DB Test User',
        };
        // Clean up any existing test data
        yield user_model_1.default.deleteMany({ email: 'db.test@example.com' });
        // Create the user
        const createdUser = yield user_model_1.default.create(testUser);
        expect(createdUser).toBeDefined();
        expect(createdUser.email).toBe('db.test@example.com');
        // Retrieve the user
        const foundUser = yield user_model_1.default.findOne({ email: 'db.test@example.com' });
        expect(foundUser).toBeDefined();
        expect(foundUser.name).toBe('DB Test User');
        // Clean up
        yield user_model_1.default.deleteMany({ email: 'db.test@example.com' });
    }));
    it('should handle concurrent database operations', () => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up any previous test data
        yield user_model_1.default.deleteMany({ email: /^concurrent/ });
        yield posts_model_1.default.deleteMany({ name: /^Concurrent Test Post/ });
        // Create a test user
        const user = yield user_model_1.default.create({
            email: 'concurrent.test@example.com',
            password: 'hashedpassword',
            name: 'Concurrent Test User',
        });
        // Prepare multiple concurrent operations
        const operations = Array(5)
            .fill(null)
            .map((_, i) => {
            return posts_model_1.default.create({
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
        const results = yield Promise.all(operations);
        expect(results.length).toBe(5);
        // Verify all posts were created
        const count = yield posts_model_1.default.countDocuments({ name: /^Concurrent Test Post/ });
        expect(count).toBe(5);
        // Clean up
        yield user_model_1.default.deleteMany({ email: /^concurrent/ });
        yield posts_model_1.default.deleteMany({ name: /^Concurrent Test Post/ });
    }));
    it('should handle database errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
        // Test duplicate key error handling
        yield user_model_1.default.deleteMany({ email: 'duplicate@example.com' });
        // Create first user
        yield user_model_1.default.create({
            email: 'duplicate@example.com',
            password: 'hashedpassword',
            name: 'Original User',
        });
        // Try to create duplicate user
        try {
            yield user_model_1.default.create({
                email: 'duplicate@example.com',
                password: 'anotherpassword',
                name: 'Duplicate User',
            });
            // Should not reach here
            throw new Error('Expected duplicate key error');
        }
        catch (error) {
            // Should be a duplicate key error
            expect(error.code).toBe(11000); // MongoDB duplicate key error code
            expect(error.keyPattern).toHaveProperty('email');
        }
        // Clean up
        yield user_model_1.default.deleteMany({ email: 'duplicate@example.com' });
    }));
});
//# sourceMappingURL=database.test.js.map