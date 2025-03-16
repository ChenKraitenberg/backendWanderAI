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
const base_controller_1 = __importDefault(require("../controllers/base_controller"));
// Create a test schema and model
const testSchema = new mongoose_1.default.Schema({
    name: String,
    description: String,
    userId: String,
    owner: String,
});
const TestModel = mongoose_1.default.model('TestItem', testSchema);
const testController = new base_controller_1.default(TestModel);
// Mock request and response objects
const mockRequest = (data = {}) => {
    return {
        body: data.body || {},
        params: data.params || {},
        query: data.query || {},
    };
};
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};
describe('BaseController Tests', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Connect to test database
        yield mongoose_1.default.connect(process.env.DB_URL || 'mongodb://localhost:27017/test_db');
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up and close connection
        yield TestModel.deleteMany({});
        yield mongoose_1.default.connection.close();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clear test collection before each test
        yield TestModel.deleteMany({});
    }));
    describe('getAll method', () => {
        test('should return all items when no filter is provided', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create test items
            yield TestModel.create([
                { name: 'Item 1', userId: 'user1', owner: 'owner1' },
                { name: 'Item 2', userId: 'user2', owner: 'owner2' },
            ]);
            const req = mockRequest();
            const res = mockResponse();
            yield testController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'Item 1' }), expect.objectContaining({ name: 'Item 2' })]));
        }));
        test('should filter items by userId', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create test items
            yield TestModel.create([
                { name: 'Item 1', userId: 'user1', owner: 'owner1' },
                { name: 'Item 2', userId: 'user2', owner: 'owner2' },
            ]);
            const req = mockRequest({ query: { userId: 'user1' } });
            const res = mockResponse();
            yield testController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'Item 1', userId: 'user1' })]));
        }));
        test('should filter items by owner', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create test items
            yield TestModel.create([
                { name: 'Item 1', userId: 'user1', owner: 'owner1' },
                { name: 'Item 2', userId: 'user2', owner: 'owner2' },
            ]);
            const req = mockRequest({ query: { owner: 'owner2' } });
            const res = mockResponse();
            yield testController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'Item 2', owner: 'owner2' })]));
        }));
        test('should handle errors gracefully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Mock a failure in find()
            jest.spyOn(TestModel, 'find').mockImplementationOnce(() => {
                throw new Error('Database error');
            });
            const req = mockRequest();
            const res = mockResponse();
            yield testController.getAll(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith(expect.any(Error));
        }));
    });
    // Similar test blocks for getById, create, update, and deleteItem methods
    // ...
    describe('getById method', () => {
        test('should return item when found', () => __awaiter(void 0, void 0, void 0, function* () {
            const item = yield TestModel.create({ name: 'Test Item' });
            const req = mockRequest({ params: { id: item._id.toString() } });
            const res = mockResponse();
            yield testController.getById(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Item' }));
        }));
        test('should return 404 when item not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = new mongoose_1.default.Types.ObjectId().toString();
            const req = mockRequest({ params: { id: nonExistentId } });
            const res = mockResponse();
            yield testController.getById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith('not found');
        }));
    });
    describe('create method', () => {
        test('should create and return new item', () => __awaiter(void 0, void 0, void 0, function* () {
            const newItem = { name: 'New Item', description: 'New Description' };
            const req = mockRequest({ body: newItem });
            const res = mockResponse();
            yield testController.create(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining(newItem));
        }));
    });
    describe('update method', () => {
        test('should update and return item', () => __awaiter(void 0, void 0, void 0, function* () {
            const item = yield TestModel.create({ name: 'Original Name' });
            const updateData = { name: 'Updated Name' };
            const req = mockRequest({
                params: { id: item._id.toString() },
                body: updateData,
            });
            const res = mockResponse();
            yield testController.update(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(expect.objectContaining(updateData));
        }));
    });
    describe('deleteItem method', () => {
        test('should delete item successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const item = yield TestModel.create({ name: 'Item to Delete' });
            const req = mockRequest({ params: { id: item._id.toString() } });
            const res = mockResponse();
            yield testController.deleteItem(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            // Verify item was deleted
            const deleted = yield TestModel.findById(item._id);
            expect(deleted).toBeNull();
        }));
    });
});
//# sourceMappingURL=base-controller.test.js.map