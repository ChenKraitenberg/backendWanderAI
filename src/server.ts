import express, { Express } from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

import postsRoute from './routes/posts_route';
import commentsRoute from './routes/comments_route';
import authRoute from './routes/auth_route';
import fileRoute from './routes/file_route'; // נתיב להעלאת קבצים
import fileAccessRoute from './routes/file-access-route'; // נתיב לגישה לקבצים
import cors from 'cors';

app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:5173', // Frontend domain
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// Routes
app.use('/posts', postsRoute);
app.use('/comments', commentsRoute);
app.use('/auth', authRoute);
app.use('/wishlist', wishlistRoute);

// Serve static files
app.use('/uploads', express.static('public/uploads'));

// נתיבי קבצים
// הנתיב /file עבור קריאות POST לטעינת קבצים (למשל: POST http://localhost:3060/file/upload)
// הנתיב /file-access עבור גישה לקבצים (למשל: GET http://localhost:3060/file-access/filename.jpg)
app.use('/file', fileRoute);
app.use('/file-access', fileAccessRoute);

app.get('/about', (req, res) => {
  res.send('Hello World!');
});

app.use('/public', express.static('public'));
app.use('/storage', express.static('storage'));
app.use(express.static('front'));

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
const specs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

const initApp = () => {
  return new Promise<Express>(async (resolve, reject) => {
    if (process.env.DB_CONNECTION == undefined) {
      reject('DB_CONNECTION is not defined');
    } else {
      await mongoose.connect(process.env.DB_CONNECTION);
      console.log('Database connection established');
      resolve(app);
    }
  });
};

export default initApp;
