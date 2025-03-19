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
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
// Import routes
const posts_route_1 = __importDefault(require("./routes/posts_route"));
const comments_route_1 = __importDefault(require("./routes/comments_route"));
const auth_route_1 = __importDefault(require("./routes/auth_route"));
const file_route_1 = __importDefault(require("./routes/file_route"));
const wishlist_route_1 = __importDefault(require("./routes/wishlist_route"));
const file_access_route_1 = __importDefault(require("./routes/file-access-route"));
// Unified CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://node113.cs.colman.ac.il',
        'http://node113.cs.colman.ac.il'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} from ${req.ip}`);
    next();
});
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
// Detailed logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
const staticOptions = {
    dotfiles: 'ignore',
    etag: true,
    fallthrough: true,
    setHeaders: (res, path) => {
        console.log(`Serving static file: ${path}`);
    }
};
// Consolidated static file serving
//app.use('/uploads', express.static('public/uploads', staticOptions));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'uploads'), Object.assign(Object.assign({}, staticOptions), { setHeaders: (res, filePath) => {
        console.log(`Serving file from uploads: ${filePath}`);
    } })));
app.use('/public', express_1.default.static('public', staticOptions));
app.use('/storage', express_1.default.static('storage', staticOptions));
app.use(express_1.default.static('front', staticOptions));
app.use(express_1.default.static(path_1.default.join(__dirname, '..', '..', 'front'), staticOptions));
// הוסיפי את זה אחרי הקוד הקיים של הקבצים הסטטיים
app.use('/profile', (req, res) => {
    console.log('Profile route hit directly');
    try {
        const indexPath = '/home/st111/backendWanderAI/front/index.html';
        if (!fs_1.default.existsSync(indexPath)) {
            console.error(`index.html not found at ${indexPath}`);
            res.status(404).send('Frontend files not found');
            return;
        }
        console.log(`Serving profile from path: ${indexPath}`);
        res.sendFile(indexPath, { root: '/' });
    }
    catch (error) {
        console.error(`Error sending index.html: ${error}`);
        res.status(500).send('Server error');
    }
});
// Routes
app.use('/posts', posts_route_1.default);
app.use('/posts/:postId/comments', comments_route_1.default);
app.use('/auth', auth_route_1.default);
app.use('/wishlist', wishlist_route_1.default);
//app.use('/uploads', express.static('public/uploads'));
app.use('/file', file_route_1.default);
app.use('/file-access', file_access_route_1.default);
// Database connection
const db = mongoose_1.default.connection;
db.on('error', (error) => {
    console.error('Database connection error:', error);
});
db.once('open', () => {
    console.log('Connected to Database successfully');
});
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Travel App REST API',
            version: '1.0.0',
            description: 'REST server with JWT authentication'
        },
        servers: [
            {
                url: `https://node113.cs.colman.ac.il:${process.env.PORT}`,
                description: 'Production server'
            }
        ],
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
const specs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// הוסיפי את זה אחרי שאר הנתיבים אבל לפני ה-fallback route
// app.use('/profile', (req, res) => {
//   console.log('Profile route hit directly');
//   // נשתמש בנתיב המדויק שמצאנו
//   const indexPath = '/home/st111/backendWanderAI/front/index.html';
//   console.log(`Serving profile from exact path: ${indexPath}`);
//   res.sendFile(indexPath);
// });
// Fallback route with enhanced logging
app.get('*', (req, res) => {
    console.log(`Fallback route hit for ${req.url}, serving: /home/st111/backendWanderAI/front/index.html`);
    try {
        // שימוש בנתיב הנכון, מבוסס על הלוגים שלך
        const indexPath = '/home/st111/backendWanderAI/front/index.html';
        // בדיקה אם הקובץ קיים
        if (!fs_1.default.existsSync(indexPath)) {
            console.error(`index.html not found at ${indexPath}`);
            res.status(404).send('Frontend files not found');
            return;
        }
        res.sendFile(indexPath, { root: '/' });
    }
    catch (error) {
        console.error(`Error sending index.html: ${error}`);
        res.status(500).send('Server error');
    }
});
// App initialization
const initApp = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!process.env.DB_CONNECTION) {
                throw new Error('DB_CONNECTION is not defined');
            }
            yield mongoose_1.default.connect(process.env.DB_CONNECTION);
            console.log('Database connection established successfully');
            resolve(app);
        }
        catch (error) {
            console.error('App initialization error:', error);
            reject(error);
        }
    }));
};
exports.default = initApp;
//# sourceMappingURL=server.js.map