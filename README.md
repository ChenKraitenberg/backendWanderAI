# WanderAI - AI-Powered Travel Social Platform 🌍

**WanderAI** is a full-stack travel social platform that helps you explore, plan, and share unforgettable journeys ✈️.  
Built with **Node.js**, **Express**, and **MongoDB** on the backend, and **React + TypeScript** on the frontend — it's your intelligent travel companion 💡🌐.

---

## Project Structure 🗂️

### Backend 📦

```
backendWanderAI/
├── src/
│   ├── app.ts           # Main app logic and configuration
│   ├── server.ts        # Server setup and route binding
│   ├── controllers/     # Logic for handling requests
│   ├── models/          # MongoDB schemas (Mongoose)
│   ├── routes/          # API endpoint definitions
│   ├── middleware/      # Custom Express middleware
```

### Frontend (React) 💻

```
frontendWanderAI/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # App views (Home, Profile, etc.)
│   ├── services/        # Axios calls to backend APIs
│   ├── context/         # Global state (e.g., AuthContext)
│   ├── utils/           # Helper functions
│   ├── types.ts         # TypeScript types
```

---

## Key Features ✨

- 🔐 **Authentication** with JWT + Refresh Tokens
- 🌐 **Google OAuth** for social login
- 📸 **Create & Share Posts** with media
- ❤️ **Like & Comment** on posts
- 🧳 **AI-Powered Travel Planning**
- ⭐ **Wishlist** to save future trips
- 🧑‍💼 **User Profiles** with avatar uploads
- 📱 **Responsive** mobile-first design

---

## Technologies ⚙️

### Backend 🔧
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT + Bcrypt
- Multer for file uploads
- Nodemailer for email

### Frontend 🎨
- React + TypeScript
- React Router
- Axios
- Bootstrap
- React Context API

---

## API Endpoints Overview 🔌

### Authentication 👤 
- `POST /auth/register` – Create account
- `POST /auth/login` – Login with email/password
- `POST /auth/social-login` – Google login
- `POST /auth/refresh` – Refresh token
- `POST /auth/logout` – Logout
- `GET /auth/me` – Get current user

###  Posts 📝
- `GET /posts` – All posts
- `POST /posts` – New post
- `PATCH /posts/:id` – Edit post
- `DELETE /posts/:id` – Delete post
- `POST /posts/:id/like` – Like/unlike post

###  Comments 💬
- `GET /posts/:postId/comments` – All comments
- `POST /posts/:postId/comments` – Add comment
- `DELETE /posts/:postId/comments/:commentId` – Delete comment

###  Files 📂
- `POST /file/upload` – Upload file
- `GET /file-access/:filename` – Access file

###  Wishlist ⭐
- `GET /wishlist` – View wishlist
- `POST /wishlist` – Add to wishlist
- `DELETE /wishlist/:id` – Remove item

---

##  Getting Started 🚀

1. Clone the repos:
   ```bash
   git clone https://github.com/ChenKraitenberg/backendWanderAI
   git clone https://github.com/ChenKraitenberg/frontendWanderAI
   ```

2. Install backend dependencies:
   ```bash
   cd backendWanderAI
   npm install
   ```

3. Set environment variables in `.env`:
   ```
   PORT=3000
   DB_CONNECTION=mongodb://localhost:27017/wanderai
   TOKEN_SECRET=your_jwt_secret
   TOKEN_EXPIRE=1h
   REFRESH_TOKEN_EXPIRE=7d
   DOMAIN_BASE=http://localhost:3000
   ```

4. Run the backend:
   ```bash
   npm start
   ```

5. Set up and run the frontend:
   ```bash
   cd ../frontendWanderAI
   npm install
   npm run dev
   ```

---

##  Security Highlights 🔐

- 🔒 Bcrypt for password hashing
- 🔐 JWT + Refresh tokens
- 📁 File validation for secure uploads
- 🧼 Input sanitization
- ✅ HTTPS support for production

```ts
// in app.ts
if(process.env.NODE_ENV === "production"){
  const props = {
    key: fs.readFileSync("../client-key.pem"),
    cert: fs.readFileSync("../client-cert.pem")
  }
  https.createServer(props, app).listen(port)
}
```

---

##  Future Roadmap 📈

- 🔔 Real-time notifications via WebSockets
- 🧠 Enhanced AI-based planning features
- 🔍 Advanced filters + search
- 🌍 Social sharing integrations
- 🧳 Travel booking API integrations

---

## License 📝

MIT © [ChenKraitenberg](https://github.com/ChenKraitenberg)
אם תרצה שאכניס את הקובץ הזה ישירות לריפו או אעזור לך עם פקודות Git – תגיד לי 
