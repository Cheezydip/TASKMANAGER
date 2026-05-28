# TaskManager

A full-stack, responsive task management application designed to help you organize, prioritize, and track your work efficiently with a sleek dark-themed UI.
check it out here-->(https://taskmanager-umber-kappa.vercel.app/)
## Features
- **Secure Authentication**: User registration and login utilizing JWT and bcrypt.
- **Task Management**: Create, edit, delete, and toggle the completion status of your tasks.
- **Live Search & Filtering**: Instantly search tasks by name or filter them by priority (High, Medium, Low) and timeframe (Today, Week).
- **Responsive UI**: Custom "Slate" dark theme designed for mobile, tablet, and desktop viewports.
- **Profile Management**: Update your account details and securely change your password.

## Tech Stack
- **Frontend**: React, Vite, React Router, raw CSS
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A running MongoDB cluster (e.g., MongoDB Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and configure the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder and set the backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the React development server:
   ```bash
   npm run dev
   ```

## Deployment
- **Frontend** configuration includes a `vercel.json` rewrite rule, making it ready for 1-click deployment on [Vercel](https://vercel.com). Remember to map your `VITE_API_URL` environment variable to your published backend URL.
- **Backend** is completely ready for deployment on [Render](https://render.com) or similar platforms. Make sure the production environment has your `MONGO_URI` and `JWT_SECRET` set up.
