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
const user_model_1 = __importDefault(require("../models/user_model"));
const test_posts_json_1 = __importDefault(require("./test_posts.json"));
let app;
const testPosts = test_posts_json_1.default;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Before all tests");
    app = yield (0, server_1.default)();
    yield posts_model_1.default.deleteMany();
    yield user_model_1.default.deleteMany();
}));
afterAll(() => {
    console.log("After all tests");
    mongoose_1.default.connection.close();
});
const testUser = {
    email: "user@test.com",
    password: "1234567",
};
describe("Auth Test", () => {
    test("Test registration", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/register").send(testUser);
        expect(response.statusCode).toBe(200);
    }));
    test("Test registration fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/register").send(testUser);
        expect(response.statusCode).not.toBe(200);
    }));
    test("Test registration fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/register").send({
            email: "",
        });
        expect(response.statusCode).not.toBe(200);
    }));
    test("Test login", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
        expect(response.statusCode).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
        expect(testUser.accessToken).toBeDefined();
        expect(testUser.refreshToken).toBeDefined();
        testUser._id = response.body._id;
    }));
    test("Test login fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send({
            email: testUser.email,
            password: "wrongpassword",
        });
        expect(response.statusCode).not.toBe(200);
        const response2 = yield (0, supertest_1.default)(app).post("/auth/login").send({
            email: "asdfasdf",
            password: "wrongpassword",
        });
        expect(response2.statusCode).not.toBe(200);
    }));
    test("Using token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/posts").send(testPosts[0]);
        expect(response.statusCode).not.toBe(201);
        const response2 = yield (0, supertest_1.default)(app).post("/posts")
            .set({ authorization: "JWT " + testUser.accessToken })
            .send(testPosts[0]);
        expect(response2.statusCode).toBe(201);
        const response3 = yield (0, supertest_1.default)(app).post("/posts")
            .set({ authorization: "JWT " + testUser.accessToken + 'f' })
            .send(testPosts[0]);
        expect(response3.statusCode).not.toBe(201);
    }));
    test("Test refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/refresh").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response.statusCode).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
        expect(testUser.accessToken).toBeDefined();
        expect(testUser.refreshToken).toBeDefined();
    }));
    test("Test refresh token fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/refresh").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response.statusCode).toBe(200);
        const newRefreshToken = response.body.refreshToken;
        const response2 = yield (0, supertest_1.default)(app).post("/auth/refresh").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response2.statusCode).not.toBe(200);
        const response3 = yield (0, supertest_1.default)(app).post("/auth/refresh").send({
            refreshToken: newRefreshToken,
        });
        expect(response3.statusCode).not.toBe(200);
    }));
    test("Test logout", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
        const response2 = yield (0, supertest_1.default)(app).post("/auth/logout").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response2.statusCode).toBe(200);
        const response3 = yield (0, supertest_1.default)(app).post("/auth/refresh").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response3.statusCode).not.toBe(200);
    }));
    test("Test distinct tokens", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
        const response2 = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
        expect(response2.statusCode).toBe(200);
        expect(response2.body.refreshToken).not.toEqual(testUser.refreshToken);
    }));
    jest.setTimeout(10000);
    test("Token expired", () => __awaiter(void 0, void 0, void 0, function* () {
        yield new Promise((resolve) => setTimeout(resolve, 5000));
        const response = yield (0, supertest_1.default)(app).post("/posts")
            .set({ authorization: "JWT " + testUser.accessToken })
            .send(testPosts[0]);
        expect(response.statusCode).not.toBe(201);
        const response2 = yield (0, supertest_1.default)(app).post("/auth/refresh").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response2.statusCode).toBe(200);
        testUser.accessToken = response2.body.accessToken;
        testUser.refreshToken = response2.body.refreshToken;
        const response3 = yield (0, supertest_1.default)(app).post("/posts")
            .set({ authorization: "JWT " + testUser.accessToken })
            .send(testPosts[0]);
        expect(response3.statusCode).toBe(201);
    }));
});
//# sourceMappingURL=auth.test.js.map