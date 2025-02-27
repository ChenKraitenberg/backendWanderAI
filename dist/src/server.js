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
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const posts_route_1 = __importDefault(require("./routes/posts_route"));
const comments_route_1 = __importDefault(require("./routes/comments_route"));
const auth_route_1 = __importDefault(require("./routes/auth_route"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const db = mongoose_1.default.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use("/posts", posts_route_1.default);
app.use("/comments", comments_route_1.default);
app.use("/auth", auth_route_1.default);
app.get("/about", (req, res) => {
    res.send("Hello World!");
});
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Dev 2025 - D - REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{ url: "http://localhost:" + process.env.PORT, },],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
const initApp = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        if (process.env.DB_CONNECTION == undefined) {
            reject("DB_CONNECTION is not defined");
        }
        else {
            yield mongoose_1.default.connect(process.env.DB_CONNECTION);
            resolve(app);
        }
    }));
};
exports.default = initApp;
//# sourceMappingURL=server.js.map