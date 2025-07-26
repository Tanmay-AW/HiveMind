# HiveMind - Collaborative Code Editor with AI

A real-time collaborative coding platform with integrated AI assistance, built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🚀 Live Demo

- **Frontend**: [https://hive-mind-puce.vercel.app](https://hive-mind-puce.vercel.app)
- **Backend**: Coming soon (deployment in progress)

## ✨ Features

### 🤝 Real-time Collaboration
- Live cursor tracking
- Operational transform synchronization
- Conflict-free editing
- Shared workspaces

### 🤖 AI-Powered Coding
- **Code Generation**: Generate code from natural language prompts
- **Code Explanation**: Get detailed explanations of any code
- **AI Debugging**: Intelligent bug detection and fixes
- **Code Execution**: Run JavaScript and Python directly in the editor

### 🔐 Authentication & Security
- JWT-based authentication
- Email verification with OTP
- Secure password handling
- Protected API endpoints

### 📧 Email Integration
- Gmail SMTP integration
- Automated verification emails
- OTP resend functionality

## 🏗️ Architecture

```
Frontend (Vercel) ←→ Backend (Render/Railway) ←→ MongoDB
     ↓                    ↓                        ↓
  Static Files      Express.js API           User Data
  Auth UI           Socket.IO               Room Data
  Editor            AI Services
```

## 📁 Project Structure

```
HiveMind-U/
├── FrontEnd/                 # Frontend application
│   ├── index.html           # Landing page with auth
│   ├── app.html             # Main editor interface
│   ├── script.js            # Authentication logic
│   ├── editor.js            # Editor functionality
│   ├── config.js            # API configuration
│   ├── style.css            # Main styles
│   ├── editor.css           # Editor-specific styles
│   └── DEPLOYMENT.md        # Frontend deployment guide
├── BackEnd/                  # Backend API server
│   ├── server.js            # Express server setup
│   ├── routes/              # API route handlers
│   ├── models/              # MongoDB models
│   ├── middleware/          # Custom middleware
│   ├── services/            # Business logic services
│   ├── socket.js            # Socket.IO real-time logic
│   └── DEPLOYMENT.md        # Backend deployment guide
└── README.md                # This file
```

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3/JavaScript** - Vanilla web technologies
- **Vercel** - Frontend deployment
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Nodemailer** - Email service
- **OpenAI API** - AI services

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Gmail account (for email service)
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HiveMind-U
   ```

2. **Backend Setup**
   ```bash
   cd BackEnd
   npm install
   cp .env.example .env  # Create and configure .env file
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd FrontEnd
   # Open index.html in browser or use a local server
   python -m http.server 8000
   ```

### Environment Variables

Create a `.env` file in the BackEnd directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:8000
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
OPENAI_API_KEY=your_openai_api_key
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/resend-otp` - Resend verification email
- `GET /api/auth/profile` - Get user profile

### AI Service Endpoints
- `POST /api/ai/run` - Execute code
- `POST /api/ai/generate` - Generate code with AI
- `POST /api/ai/explain` - Explain code with AI
- `POST /api/ai/debug` - Debug code with AI

## 🔧 Deployment

### Frontend (Vercel)
- ✅ Already deployed at `https://hive-mind-puce.vercel.app`
- See `FrontEnd/DEPLOYMENT.md` for details

### Backend
- ⏳ Deployment in progress
- See `BackEnd/DEPLOYMENT.md` for deployment options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the deployment guides in each directory
- Review the troubleshooting sections
- Open an issue on GitHub

---

**Built with ❤️ for the developer community**