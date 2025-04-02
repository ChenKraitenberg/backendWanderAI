# WanderAI - Node.js/Express Travel Social Platform

WanderAI is a full-stack travel social platform built with Node.js and Express on the backend, with React on the frontend. The application allows users to share their travel experiences, plan trips, and engage with other travelers through posts, comments, and likes.

## Project Structure

The codebase is organized into a standard Node.js/Express backend structure:

### Backend

- **src/app.ts**: Entry point of the application
- **src/server.ts**: Server configuration, middleware setup, and route registration
- **src/controllers/**: Business logic for handling requests
- **src/models/**: Mongoose schemas and models for MongoDB
- **src/routes/**: Express route definitions
- **src/middleware/**: Custom middleware functions

### Frontend (React)

- **src/components/**: React components (UI elements)
- **src/pages/**: React pages (full views composed of components)
- **src/services/**: API client services for backend communication
- **src/context/**: React context providers for state management
- **src/utils/**: Utility functions
- **src/types.ts**: TypeScript type definitions

## Key Features

- **User Authentication**: Complete JWT-based authentication system with refresh tokens
- **Social Login**: Google OAuth integration
- **Post Management**: Create, read, update, delete travel posts
- **Social Interactions**: Like and comment on posts
- **Profile Management**: User profiles with avatar upload
- **Travel Planning**: Generate AI travel itineraries
- **Wishlist**: Save and manage travel plans
- **Responsive Design**: Mobile-friendly interface

## Technologies Used

- **Backend**:
  - Node.js
  - Express
  - TypeScript
  - MongoDB/Mongoose
  - JWT Authentication
  - Multer (file uploads)
  - Bcrypt (password hashing)
  - Nodemailer (email services)

- **Frontend**:
  - React
  - TypeScript
  - React Router
  - Axios
  - Bootstrap
  - React Context API

## API Endpoints

### Authentication
- `POST /auth/register`: Register a new user
- `POST /auth/login`: Log in an existing user
- `POST /auth/refresh`: Refresh access token
- `POST /auth/logout`: Log out a user
- `GET /auth/me`: Get current user info
- `POST /auth/social-login`: Social login with Google

### Posts
- `GET /posts`: Get all posts or filtered posts
- `GET /posts/:id`: Get a specific post
- `POST /posts`: Create a new post
- `PATCH /posts/:id`: Update a post
- `DELETE /posts/:id`: Delete a post
- `POST /posts/:id/like`: Toggle like for a post

### Comments
- `GET /posts/:postId/comments`: Get all comments for a post
- `POST /posts/:postId/comments`: Add a comment to a post
- `DELETE /posts/:postId/comments/:commentId`: Delete a comment

### Files
- `POST /file/upload`: Upload a file
- `GET /file-access/:filename`: Access an uploaded file

### Wishlist
- `GET /wishlist`: Get all wishlist items for current user
- `POST /wishlist`: Add an item to wishlist
- `DELETE /wishlist/:id`: Remove an item from wishlist

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```
   PORT=3000
   DB_CONNECTION=mongodb://localhost:27017/wanderai
   TOKEN_SECRET=your_jwt_secret
   TOKEN_EXPIRE=1h
   REFRESH_TOKEN_EXPIRE=7d
   DOMAIN_BASE=your_domain
   ```
4. Start the server:
   ```
   npm start
   ```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication with refresh tokens
- Secure file upload validation
- Input validation and sanitization
- HTTPS support for production environments
- Protection against common vulnerabilities

## Production Deployment

For production deployment, set `NODE_ENV=production` to enable HTTPS with SSL certificates:

```javascript
// This code is in app.ts
if(process.env.NODE_ENV == "production"){
  const prop={
    key: fs.readFileSync("../client-key.pem"),
    cert: fs.readFileSync("../client-cert.pem")
  }
  https.createServer(prop,app).listen(port)
}
```

## Future Enhancements

- Real-time notifications using WebSockets
- Enhanced trip planning features with AI integration
- Social sharing capabilities
- Advanced search and filtering
- Integration with travel booking APIs
