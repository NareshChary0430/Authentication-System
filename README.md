🔐 Authentication System

🚀 A production-ready authentication system with JWT, refresh token rotation, session management, and OTP verification.

✨ Overview

This project demonstrates a secure authentication architecture used in real-world applications.
It includes modern best practices like token rotation, multi-device session handling, and email-based OTP verification.

🚀 Features

🔥 Core Authentication

User Registration & Login

JWT Access Token + Refresh Token

Request-based User Identification

🔐 Security Enhancements

Refresh Token Rotation

Session Management System

Logout (Single Device & All Devices)

Secure Token Handling

📧 OTP System

Email OTP Verification

Account Activation Flow

🧠 Architecture Flow
🛠 Tech Stack
Layer	Technology
Backend	Node.js, Express.js
Database	MongoDB
Authentication	JWT (Access + Refresh)
Security	Token Rotation, Sessions
OTP Service	Email Verification
📂 Folder Structure
Authentication-System/
│── controllers/
│── models/
│── routes/
│── middleware/
│── utils/
│── config/
│── server.js
│── .env
⚙️ Setup Instructions
🔽 Clone Repository
git clone https://github.com/your-username/Authentication-System.git
cd Authentication-System
📦 Install Dependencies
npm install
🔑 Environment Variables

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
▶️ Run Server
npm start
🔌 API Endpoints
Method	Endpoint	Description
POST	/register	Register user
POST	/verify-otp	Verify OTP
POST	/login	Login & get tokens
POST	/refresh-token	Generate new tokens
POST	/logout	Logout (single device)
POST	/logout-all	Logout from all devices
🖼 Screenshots

📸 Add your project screenshots here (UI / API testing / Postman)

🔐 Security Highlights

🛡️ Token Rotation prevents replay attacks

📱 Multi-device session tracking

🔑 Short-lived access tokens

🔄 Refresh token invalidation

📧 OTP-based verification

🚀 Future Enhancements

🔐 Google OAuth / Social Login

⚡ Rate Limiting (Brute-force protection)

🧑‍💼 Role-Based Access Control (RBAC)

🔒 Two-Factor Authentication (2FA)

🤝 Contributing

Contributions are welcome!
Fork this repo and submit a pull request 🚀

📜 License

MIT License © 2026

🌟 Show Your Support

If you like this project:

⭐ Star this repo
🍴 Fork it
📢 Share with others
