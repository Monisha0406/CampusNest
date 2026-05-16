# SmartStay - Hostel Management Platform

A complete, full-stack Hostel Management System web application built with the MERN stack (MongoDB, Express, React, Node.js). Features role-based access control (Admin/Student), dynamic dashboard analytics, secure authentication, and a modern glassmorphic UI.

## Features

- **Admin Portal**: 
  - Manage all students (Add, Edit, Delete).
  - Manage rooms (Create, Assign students, Track occupancy).
  - Fee tracking (Record payments, track overdue fees).
  - Resolve complaints.
  - Interactive dashboard with real-time analytics (Chart.js).

- **Student Portal**:
  - View assigned room details.
  - Track fee invoices and payment history.
  - Raise complaints and track resolution status.

## Tech Stack

- **Frontend**: React.js (Vite), React Router DOM, Axios, Chart.js, Lucide Icons. Pure vanilla CSS with CSS variables and modern layout techniques.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose).
- **Authentication**: JWT (JSON Web Tokens) and bcrypt.

## Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB server)

### 2. Backend Setup
1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file in the `backend` directory with your MongoDB connection string (or use the provided default for Atlas testing).
4. **Seed the database** with demo data (this will create an admin, some students, rooms, fees, and complaints):
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *(Server will run on `http://localhost:5000`)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *(App will open on `http://localhost:5173`)*

## Demo Accounts

**Admin Login:**
- Email: `admin@smartstay.com`
- Password: `admin123`

**Student Login:**
- Email: `rahul@student.com`
- Password: `student123`

## API Endpoints Overview

- **Auth**: `POST /api/auth/login`, `GET /api/auth/me`
- **Dashboard**: `GET /api/dashboard/stats` (Admin only)
- **Students**: `GET /api/students`, `POST /api/students`, `DELETE /api/students/:id`
- **Rooms**: `GET /api/rooms`, `POST /api/rooms/:id/assign`
- **Fees**: `GET /api/fees`, `POST /api/fees/:id/pay`
- **Complaints**: `GET /api/complaints`, `PUT /api/complaints/:id`
