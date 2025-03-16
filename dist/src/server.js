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
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const posts_route_1 = __importDefault(require("./routes/posts_route"));
const comments_route_1 = __importDefault(require("./routes/comments_route"));
const auth_route_1 = __importDefault(require("./routes/auth_route"));
const file_route_1 = __importDefault(require("./routes/file_route")); // נתיב להעלאת קבצים
const wishlist_route_1 = __importDefault(require("./routes/wishlist_route"));
const file_access_route_1 = __importDefault(require("./routes/file-access-route")); // נתיב לגישה לקבצים
const cors_1 = __importDefault(require("cors"));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Frontend domain
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
const db = mongoose_1.default.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});
// Routes
app.use('/posts', posts_route_1.default);
app.use('/posts/:postId/comments', comments_route_1.default);
// app.use('/comments', commentsRoute);
app.use('/auth', auth_route_1.default);
app.use('/wishlist', wishlist_route_1.default);
// Serve static files
app.use('/uploads', express_1.default.static('public/uploads'));
app.use('/file', file_route_1.default);
app.use('/file-access', file_access_route_1.default);
app.get('/about', (req, res) => {
    res.send('Hello World!');
});
app.use('/public', express_1.default.static('public'));
app.use('/storage', express_1.default.static('storage'));
app.use(express_1.default.static('front'));
// Swagger configuration
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Travel App REST API',
            version: '1.0.0',
            description: 'REST server including authentication using JWT with social login integration',
        },
        servers: [{ url: 'http://localhost:' + process.env.PORT }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
const initApp = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        if (process.env.DB_CONNECTION == undefined) {
            reject('DB_CONNECTION is not defined');
        }
        else {
            yield mongoose_1.default.connect(process.env.DB_CONNECTION);
            console.log('Database connection established');
            resolve(app);
        }
    }));
};
exports.default = initApp;
//# sourceMappingURL=server.js.map