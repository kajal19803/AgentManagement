Project Title: CSTech Admin Panel – Agent Management and CSV Distribution (MERN Stack)

Objective
To build a fully functional MERN stack application that allows an admin user to:
Log in securely,Create and manage agents,Upload a CSV/XLSX file,Automatically distribute the list among agents,View distribution in a user-friendly dashboard

Implemented Features
1. Admin Login
Secure login using email & password
JWT-based authentication
Protected dashboard route
Error handling with descriptive messages
Logout functionality

👤 2. Agent Management
Add agents with the following mandatory fields:
Name,Email,Mobile number (with country code),Password,Form validation for missing fields,Auto-refresh after agent creation,Agent list rendered on dashboard

3. CSV/XLSX Upload & Distribution
Upload .csv, .xlsx, or .xls files only
Client-side file format validation
Server-side structure validation
Distributed list logic: Equally divided among 5 agents,Remainders handled sequentially,Saved and displayed per agent,Real-time UI update after upload

4. Dark/Light Mode Toggle
Global theme context using useTheme()
Theme toggle button on both Login and Dashboard
TailwindCSS darkMode: 'class' setup
Smooth transitions using transition-colors

5. Branding
Favicon replaced with CSTech logo
Page title changed to CSTech
React logo completely removed

Tech Stack
Layer              Technology
Frontend	      React.js + TailwindCSS
Backend	          Node.js + Express.js
Database	      MongoDB
Auth	          JWT (JSON Web Token)
File Upload	      multer

Technical Implementation Highlights
JWT stored on login, sent in headers for protected routes
Separate context for managing theme
multer used for file uploads
Upload logic parses rows and distributes evenly among agents
Clean folder structure with reusable components (AlertModal, etc.)
.env setup for MongoDB URI, JWT secret, etc.

Deliverables
Full source code (Frontend + Backend)
.env.example file with necessary keys
Setup instructions in README.md
Working video demo uploaded to Google Drive

Tested Scenarios
Login with wrong credentials – error shown
Upload invalid file – validation triggered
Fewer than 5 agents – leftover handling
Empty agent form – alerts shown
Token tampering – access denied
Theme toggle across pages

How to Run Locally

# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start

Create a .env file in the backend folder:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret



