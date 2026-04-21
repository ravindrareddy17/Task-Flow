# TaskFlow Deployment Guide

This guide provides instructions for deploying the TaskFlow collaborative task management platform.

## Prerequisites
- Node.js (v18+)
- MySQL Database
- Environment variables configured

## Project Structure
- `client/`: React frontend
- `server/`: Node.js/Express backend

---

## 1. Build the Frontend
Navigate to the `client` directory and run:
```bash
npm install
npm run build
```
This will generate a `dist` folder containing the optimized production assets.

## 2. Prepare the Backend
Navigate to the `server` directory and run:
```bash
npm install
```

## 3. Configuration (Environment Variables)
Create a `.env` file in the `server` directory using the provided `.env.example`:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_secret_key
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=taskflow_db
CLIENT_URL=https://your-production-url.com
```

## 4. Run the Application
Start the server in production mode:
```bash
cd server
npm start
```
The server will now serve the frontend statically from `client/dist` and handle API/WebSocket requests on the same port.

---

## Deployment Options

### Single Server (Heroku, Railway, VPS)
1. Build the client locally or via CI/CD.
2. Push both `client/dist` and `server/` to the server.
3. Ensure `NODE_ENV=production` is set.
4. Run `npm start` in the `server` folder.

### Decoupled Deployment (Netlify/Vercel + Backend)
If you prefer to host the frontend separately:
1. Deploy `client/` to Netlify/Vercel.
2. Update `server.js` CORS to allow the frontend domain.
3. Update `client/src/services/api.js` Base URL to point to your backend API.
