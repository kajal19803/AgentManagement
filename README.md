✅ Project Title: CSTech Admin Panel – Agent Management and CSV Distribution (MERN Stack)

🎯 Objective
To build a secure and scalable MERN stack admin panel that allows:
Admin login with CSRF protection
Agent creation, management, soft deletion & restoration
Upload and structured distribution of contact lists from CSV/XLSX files
Full login analytics and geoIP tracking
Dark/light mode and branded dashboard UI

⚙️ Implemented Features
🔐 1. Admin Authentication
Secure login using Email & Password
CSRF token protection with SameSite cookie handling
JWT stored in HttpOnly cookies
Rate limiting to prevent brute-force
Location-based login alerts sent on new IP
Protected routes via middleware (auth, isAdmin)
Logout and current user fetch (/me)
Login history analytics (/login-analytics)

👥 2. Agent Management
Create agent with:
Name, Email, Mobile Number, Country Code, Password
Strict validations (e.g., password strength, mobile format based on country)
Soft delete an agent
Restore a deleted agent
Search, pagination, and inclusion of deleted agents
Clear feedback messages on success/error

📁 3. CSV/XLSX Upload & Distribution
Upload files: .csv, .xlsx, .xls (max 5MB)
Client-side & server-side file format validation
Data must include: FirstName, Phone, Notes
Tasks distributed evenly among 5 agents
Remainders handled sequentially
Data saved in MongoDB under timestamped batches
History of uploaded batches retrievable with pagination, search, filters
Each agent’s share displayed clearly

🌙 4. Dark/Light Mode Toggle
Global ThemeContext via React
Toggle on Login & Dashboard pages
Tailwind darkMode: 'class' setup
Smooth transition animation

🖼️ 5. Branding & UI Polish
Custom CSTech favicon and page title
Removed default React branding
Responsive layout and smooth UI interactions
Alerts and modals (e.g., file validation, confirm deletion)

🛠️ Tech Stack
Layer	Technology
Frontend	React.js + TailwindCSS
Backend	Node.js + Express.js
Database	MongoDB (Mongoose)
Auth	JWT + HttpOnly Cookies
File Upload	Multer + Express Validator
Security	Helmet, mongoSanitize, Rate Limit, CSRF
Analytics	IP-based login history, location detection

🧪 Tested Scenarios
✅ Invalid login: shows proper message
✅ Invalid email/password: handled
✅ New IP: triggers geoIP email alert
✅ Token tampering: access denied
✅ Upload invalid file: error shown
✅ File > 5MB: upload rejected
✅ Less than 5 agents: distribution still succeeds
✅ Agent with duplicate email: error shown
✅ Restore deleted agent: success confirmed
✅ Dark/light mode persists across pages

📝 How to Run Locally
🔄 Backend
cd backend
npm install
npm run dev
💻 Frontend
cd frontend
npm install
npm start

📁 .env File (backend)
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
NODE_ENV=development







