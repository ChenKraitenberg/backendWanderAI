import express, { Express } from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';

//import postsRoute from './routes/posts_route';
import tripsRoute from './routes/trips_router';
import commentsRoute from './routes/comments_route';
import authRoute from './routes/auth_route';
import fileRoute from './routes/file_route';
import cors from 'cors';
const axios = require('axios');

app.use(
  cors({
    origin: 'http://localhost:5173', // הדומיין של הפרונט
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  res.header('Access-Control-Allow-Origin', ' http://localhost:5173');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/trips', tripsRoute);
app.use('/comments', commentsRoute);
app.use('/auth', authRoute);

app.use('/uploads', express.static('public/uploads'));
//app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));

app.use('/file', fileRoute);

app.get('/about', (req, res) => {
  res.send('Hello World!');
});

app.use('/public', express.static('public'));
app.use('/storage', express.static('storage'));
app.use(express.static('front'));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Web Dev 2025 - D - REST API',
      version: '1.0.0',
      description: 'REST server including authentication using JWT',
    },
    servers: [{ url: 'http://localhost:' + process.env.PORT }],
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
      resolve(app);
    }
  });
};

export default initApp;
