# TaskFlow — Collaborative Task Manager

A production-ready web application with real-time chat, media sharing, and premium Apple-level design.

**Built by Ravindra Reddy Pasam**

---

## 🧱 Tech Stack

| Layer     | Technology                                        |
|-----------|---------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4, Framer Motion    |
| Backend   | Node.js, Express.js, Socket.IO                    |
| Database  | MySQL + Sequelize ORM                             |
| Auth      | JWT (bcrypt password hashing)                     |
| Storage   | Cloudinary (file/image uploads)                   |
| Real-Time | Socket.IO (task-specific chat rooms)              |

---

## 📦 Project Structure

```
task/
├── server/                    # Backend
│   ├── config/db.js           # Sequelize MySQL config
│   ├── controllers/           # Auth, Task, Subtask, User, Upload, Message
│   ├── middleware/auth.js     # JWT verification
│   ├── models/                # User, Task, Subtask, TaskAssignment, Message
│   ├── routes/                # API route definitions
│   ├── sockets/chatSocket.js  # Socket.IO chat handler
│   ├── server.js              # Express + Socket.IO entry
│   └── .env                   # Environment variables
│
├── client/                    # Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # Navbar, Sidebar
│   │   │   ├── tasks/         # TaskCard, TaskModal
│   │   │   └── chat/          # ChatPanel
│   │   ├── pages/             # LoginPage, SignupPage, DashboardPage
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # useTasks, useSocket
│   │   ├── services/          # api.js, socket.js
│   │   ├── App.jsx            # Router
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Design system
│   ├── index.html
│   └── vite.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+
- **MySQL** 8.0+ (running locally or cloud)
- **Cloudinary** account (free tier works)

### 1. Create MySQL Database

```sql
CREATE DATABASE taskflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Tables are auto-created by Sequelize on first `npm start`.

### 2. Backend Setup

```bash
cd server
npm install
```

Edit `.env` with your values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=taskflow
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=change_this_to_a_random_64_char_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

Server runs at `http://localhost:5000`. On first start, Sequelize will auto-sync all tables.

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

App opens at `http://localhost:5173`.

---

## 🔑 API Routes

| Method | Endpoint                     | Auth | Description              |
|--------|------------------------------|------|--------------------------|
| POST   | `/api/auth/signup`           | No   | Create account           |
| POST   | `/api/auth/login`            | No   | Login & get JWT          |
| GET    | `/api/tasks`                 | Yes  | Get all tasks            |
| POST   | `/api/tasks`                 | Yes  | Create task              |
| PUT    | `/api/tasks/:id`             | Yes  | Update task              |
| DELETE | `/api/tasks/:id`             | Yes  | Delete task              |
| POST   | `/api/tasks/:taskId/subtasks`| Yes  | Create subtask           |
| PUT    | `/api/subtasks/:id`          | Yes  | Update subtask           |
| DELETE | `/api/subtasks/:id`          | Yes  | Delete subtask           |
| GET    | `/api/users`                 | Yes  | List all users           |
| GET    | `/api/users/me`              | Yes  | Get current user         |
| POST   | `/api/upload`                | Yes  | Upload file (Cloudinary) |
| GET    | `/api/tasks/:taskId/messages`| Yes  | Get task chat history    |

### Socket.IO Events

| Event        | Direction       | Description                    |
|--------------|-----------------|--------------------------------|
| `joinRoom`   | Client → Server | Join task chat room            |
| `leaveRoom`  | Client → Server | Leave task chat room           |
| `sendMessage` | Client → Server | Send message (saved to DB)    |
| `newMessage`  | Server → Client | Broadcast new message          |
| `typing`     | Client → Server | User started typing            |
| `stopTyping` | Client → Server | User stopped typing            |
| `userTyping`  | Server → Client | Broadcast typing indicator     |
| `userStopTyping`| Server → Client | Broadcast stop typing       |

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

-- Tasks table
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  dueDate DATE,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
  createdBy INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

-- Subtasks table
CREATE TABLE subtasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  taskId INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (taskId) REFERENCES tasks(id)
);

-- Task assignments (many-to-many)
CREATE TABLE task_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  taskId INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (taskId) REFERENCES tasks(id)
);

-- Messages table
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT,
  fileUrl VARCHAR(500),
  taskId INT NOT NULL,
  userId INT NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (taskId) REFERENCES tasks(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## 🌐 Deployment Guide

### Frontend → Vercel

1. Push `client/` to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set **Root Directory** to `client`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add env var: `VITE_API_URL=https://your-backend-url.com`
7. Deploy

### Backend → Render / Railway

1. Push `server/` to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all env vars from `.env` (update `CLIENT_URL` to your Vercel URL)
6. Deploy

### Database → Railway / PlanetScale

1. Create a MySQL instance on [Railway](https://railway.app) or [PlanetScale](https://planetscale.com)
2. Copy the connection details into your backend env vars
3. Sequelize will auto-create tables on first run

---

## 🎨 Design System

| Token              | Value                                          |
|--------------------|------------------------------------------------|
| Background         | `#0a0a0a`                                      |
| Card               | `#111111`                                      |
| Accent Gold        | `#d4af37`                                      |
| Text Primary       | `#f5f5f5`                                      |
| Text Secondary     | `#a0a0a0`                                      |
| Heading Font       | Playfair Display (serif)                       |
| Body Font          | Inter (sans-serif)                             |
| Border Radius      | 16px (cards), 12px (inputs), 24px (modals)     |
| Glassmorphism      | `backdrop-filter: blur(20px)`                  |

---

## ✨ Features

- ✅ JWT Authentication (signup/login)
- ✅ Task CRUD with priority, status, due dates
- ✅ Subtask management with inline checkboxes
- ✅ Multi-user task assignment
- ✅ Real-time chat per task (Socket.IO)
- ✅ Typing indicators
- ✅ File/image upload to Cloudinary
- ✅ Dashboard with stats and filters
- ✅ Apple-level dark theme with glassmorphism
- ✅ Framer Motion animations throughout
- ✅ Responsive design
- ✅ Skeleton loading states
