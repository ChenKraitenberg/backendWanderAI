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
const comments_model_1 = __importDefault(require("../models/comments_model"));
const test_comments_json_1 = __importDefault(require("./test_comments.json"));
let app;
const testComments = test_comments_json_1.default;
const baseUrl = "/comments";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Before all tests");
    app = yield (0, server_1.default)();
    yield comments_model_1.default.deleteMany();
}));
afterAll(() => {
    console.log("After all tests");
    mongoose_1.default.connection.close();
});
describe("Comments Test", () => {
    test("Test get all comments empty", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    }));
    test("Test create new comment", () => __awaiter(void 0, void 0, void 0, function* () {
        for (let comment of testComments) {
            const response = yield (0, supertest_1.default)(app).post(baseUrl).send(comment);
            expect(response.statusCode).toBe(201);
            expect(response.body.comment).toBe(comment.comment);
            expect(response.body.postId).toBe(comment.postId);
            expect(response.body.owner).toBe(comment.owner);
            comment._id = response.body._id;
        }
    }));
    test("Test get all post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testComments.length);
    }));
    test("Test get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(baseUrl + "/" + testComments[0]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testComments[0]._id);
    }));
    test("Test filter post by owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(baseUrl + "?owner=" + testComments[0].owner);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    }));
    test("Test Delete post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete(baseUrl + "/" + testComments[0]._id);
        expect(response.statusCode).toBe(200);
        const responseGet = yield (0, supertest_1.default)(app).get(baseUrl + "/" + testComments[0]._id);
        expect(responseGet.statusCode).toBe(404);
    }));
    test("Test create new post fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post(baseUrl).send({
            title: "Test Post 1",
            content: "Test Content 1",
        });
        expect(response.statusCode).toBe(400);
    }));
});
//# sourceMappingURL=comments.test.js.map