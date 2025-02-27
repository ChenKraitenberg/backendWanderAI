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
const posts_model_1 = __importDefault(require("../models/posts_model"));
const test_posts_json_1 = __importDefault(require("./test_posts.json"));
let app;
const testPosts = test_posts_json_1.default;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Before all tests");
    app = yield (0, server_1.default)();
    yield posts_model_1.default.deleteMany();
}));
afterAll(() => {
    console.log("After all tests");
    mongoose_1.default.connection.close();
});
describe("Posts Test", () => {
    test("Test get all post empty", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    }));
    test("Test create new post", () => __awaiter(void 0, void 0, void 0, function* () {
        for (let post of testPosts) {
            const response = yield (0, supertest_1.default)(app).post("/posts").send(post);
            expect(response.statusCode).toBe(201);
            expect(response.body.title).toBe(post.title);
            expect(response.body.content).toBe(post.content);
            expect(response.body.owner).toBe(post.owner);
            post._id = response.body._id;
        }
    }));
    test("Test get all post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length);
    }));
    test("Test get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/" + testPosts[0]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testPosts[0]._id);
    }));
    test("Test filter post by owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts?owner=" + testPosts[0].owner);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
    }));
    test("Test Delete post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/posts/" + testPosts[0]._id);
        expect(response.statusCode).toBe(200);
        const responseGet = yield (0, supertest_1.default)(app).get("/posts/" + testPosts[0]._id);
        expect(responseGet.statusCode).toBe(404);
    }));
    test("Test create new post fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/posts").send({
            title: "Test Post 1",
            content: "Test Content 1",
        });
        expect(response.statusCode).toBe(400);
    }));
});
//# sourceMappingURL=posts.test%20copy.js.map