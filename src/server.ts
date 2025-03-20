
import express, { Express, Request as ExpressRequest, Response as ExpressResponse } from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';
import fs from 'fs';
import axios from 'axios';

// Import routes
import postsRoute from './routes/posts_route';
import commentsRoute from './routes/comments_route';
import authRoute from './routes/auth_route';
import fileRoute from './routes/file_route';
import wishlistRoute from './routes/wishlist_route';
import fileAccessRoute from './routes/file-access-route';

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
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Static file serving with logging
interface StaticFileOptions {
  dotfiles: 'ignore' | 'allow' | 'deny';
  etag: boolean;
  fallthrough: boolean;
  setHeaders: (res: express.Response, path: string) => void;
}

const staticOptions: StaticFileOptions = {
  dotfiles: 'ignore',
  etag: true,
  fallthrough: true,
  setHeaders: (res: express.Response, path: string) => {
    console.log(`Serving static file: ${path}`);
  }
};

// Consolidated static file serving
//app.use('/uploads', express.static('public/uploads', staticOptions));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'), {
  ...staticOptions,
  setHeaders: (res, filePath) => {
    console.log(`Serving file from uploads: ${filePath}`);
  }
}));
app.use('/public', express.static('public', staticOptions));
app.use('/storage', express.static('storage', staticOptions));
app.use(express.static('front', staticOptions));
app.use(express.static(path.join(__dirname, '..', '..', 'front'), staticOptions));
// הוסיפי את זה אחרי הקוד הקיים של הקבצים הסטטיים
app.use('/profile', (req, res) => {
  console.log('Profile route hit directly');
  
  try {
    const indexPath = '/home/st111/backendWanderAI/front/index.html';
    
    if (!fs.existsSync(indexPath)) {
      console.error(`index.html not found at ${indexPath}`);
       res.status(404).send('Frontend files not found');
        return;
    }
    
    console.log(`Serving profile from path: ${indexPath}`);
     res.sendFile(indexPath, { root: '/' });
  } catch (error) {
    console.error(`Error sending index.html: ${error}`);
     res.status(500).send('Server error');
  }
});
// Routes
app.use('/posts', postsRoute);
app.use('/posts/:postId/comments', commentsRoute);
app.use('/auth', authRoute);
app.use('/wishlist', wishlistRoute);
//app.use('/uploads', express.static('public/uploads'));

app.use('/file', fileRoute);
app.use('/file-access', fileAccessRoute);

// Database connection
const db = mongoose.connection;
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

const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
// הוסיפי את זה אחרי שאר הנתיבים אבל לפני ה-fallback route
// app.use('/profile', (req, res) => {
//   console.log('Profile route hit directly');
  
//   // נשתמש בנתיב המדויק שמצאנו
//   const indexPath = '/home/st111/backendWanderAI/front/index.html';
  
//   console.log(`Serving profile from exact path: ${indexPath}`);
//   res.sendFile(indexPath);
// });


app.post('/api/ai/generate', async (req, res) => {
  try {
    console.log('AI generate request received');
    const HF_API_TOKEN = process.env.HF_API_TOKEN || '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';
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HF_API_TOKEN}`
        }
      }
    );
    
    console.log('AI response received successfully');
    res.json(response.data);
  } catch (error: any) {
    console.error('Error calling Hugging Face API:', error);
    res.status(500).json({ 
      error: 'Failed to generate trip content',
      details: error.response?.data || error.message || String(error)
    });
  }
});



// Fallback route with enhanced logging
app.get('*', (req: ExpressRequest, res: ExpressResponse) => {
  console.log(`Fallback route hit for ${req.url}, serving: /home/st111/backendWanderAI/front/index.html`);
  
  try {
    // שימוש בנתיב הנכון, מבוסס על הלוגים שלך
    const indexPath = '/home/st111/backendWanderAI/front/index.html';
    
    // בדיקה אם הקובץ קיים
    if (!fs.existsSync(indexPath)) {
      console.error(`index.html not found at ${indexPath}`);
       res.status(404).send('Frontend files not found');
       return;
    }
    
     res.sendFile(indexPath, { root: '/' });
  } catch (error) {
    console.error(`Error sending index.html: ${error}`);
     res.status(500).send('Server error');
  }
});

// App initialization
const initApp = () => {
  return new Promise<Express>(async (resolve, reject) => {
    try {
      if (!process.env.DB_CONNECTION) {
        throw new Error('DB_CONNECTION is not defined');
      }
      
      await mongoose.connect(process.env.DB_CONNECTION);
      console.log('Database connection established successfully');
      resolve(app);
    } catch (error) {
      console.error('App initialization error:', error);
      reject(error);
    }
  });
};

export default initApp;
