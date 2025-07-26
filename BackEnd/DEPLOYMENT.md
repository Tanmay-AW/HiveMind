# HiveMind Backend Deployment Guide

## Environment Variables Required

Create a `.env` file in the BackEnd directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=https://hive-mind-ai.vercel.app

# Email Service (Gmail)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# AI Service (OpenAI)
OPENAI_API_KEY=your_openai_api_key
```

## Deployment Platforms

### Option 1: Render (Recommended)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables in Render dashboard

### Option 2: Railway
1. Connect your GitHub repository to Railway
2. Railway will auto-detect Node.js
3. Add environment variables in Railway dashboard
4. Deploy automatically

### Option 3: Heroku
1. Create a new Heroku app
2. Connect your GitHub repository
3. Add environment variables in Heroku dashboard
4. Deploy

## CORS Configuration

The backend is already configured to accept requests from your Vercel frontend. The CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/resend-otp` - Resend verification email
- `GET /api/auth/profile` - Get user profile (protected)

### AI Services
- `POST /api/ai/run` - Execute code
- `POST /api/ai/generate` - Generate code with AI
- `POST /api/ai/explain` - Explain code with AI
- `POST /api/ai/debug` - Debug code with AI

## Testing the Backend

1. **Health Check**: Visit your backend URL to ensure it's running
2. **API Test**: Use Postman or curl to test endpoints
3. **CORS Test**: Try making a request from your frontend

## After Deployment

1. Get your backend URL (e.g., `https://your-app.onrender.com`)
2. Update the frontend `config.js` file:
   ```javascript
   BACKEND_URL: "https://your-app.onrender.com"
   ```
3. Redeploy the frontend to Vercel
4. Test the full integration

## Troubleshooting

### Common Issues:
1. **MongoDB Connection**: Check your MONGO_URI
2. **Email Not Sending**: Verify Gmail credentials
3. **AI Features Not Working**: Check OpenAI API key
4. **CORS Errors**: Verify FRONTEND_URL environment variable

### Debug Steps:
1. Check deployment logs
2. Verify environment variables are set
3. Test endpoints individually
4. Check database connectivity

## Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets
- Enable HTTPS in production
- Regularly update dependencies 