# HiveMind Deployment Guide

This guide will help you deploy your HiveMind application with the frontend on Vercel and backend on Render.

## 🚀 Quick Deployment Steps

### 1. Deploy Backend on Render

#### Option A: Using Render Dashboard (Recommended)
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select the `HiveMind` repository
4. Configure the service:
   - **Name**: `hivemind-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `BackEnd`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

5. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/hivemind
   JWT_SECRET=your-super-secret-jwt-key-here
   FRONTEND_URL=https://hive-mind-ai.vercel.app
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-gmail-app-password
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

6. Click "Deploy Web Service"

#### Option B: Using render.yaml (Alternative)
1. The `render.yaml` file in the root directory can be used for deployment
2. Update the environment variables in the file
3. Deploy via Render dashboard by connecting to the repository

### 2. Deploy Frontend on Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository `HiveMind`
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `/` (leave default)
   - **Build Command**: `echo "Static site - no build required"`
   - **Output Directory**: `FrontEnd`
   - **Install Command**: `echo "No install required"`

5. **Environment Variables** (Optional):
   ```
   NODE_ENV=production
   ```

6. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod

# Follow the prompts and set:
# - Setup and deploy: Y
# - Which scope: Your personal account
# - Link to existing project: N
# - Project name: hivemind-frontend
# - Directory: FrontEnd
```

### 3. Update Configuration

After both deployments, you'll get URLs like:
- **Backend**: `https://hivemind-backend-xyz.onrender.com`
- **Frontend**: `https://hive-mind-ai.vercel.app`

#### Update Backend CORS (if needed)
Update `BackEnd/server.js` if your Vercel URL is different:
```javascript
const allowedOrigins = [
  'https://your-actual-vercel-url.vercel.app', // Your actual Vercel URL
  'https://hive-mind-ai.vercel.app',
  // ... other origins
];
```

#### Update Frontend Config
Update `FrontEnd/config.js` with your actual backend URL:
```javascript
BACKEND_URL: isLocalhost
    ? "http://localhost:3000"
    : "https://your-actual-render-url.onrender.com", // Your actual Render URL
```

### 4. Required Environment Variables

#### For MongoDB (Required)
- Get a free MongoDB Atlas account: [mongodb.com/atlas](https://mongodb.com/atlas)
- Create a cluster and get the connection string
- Replace `<password>` with your database user password
- Example: `mongodb+srv://username:password@cluster0.abcdef.mongodb.net/hivemind`

#### For Gmail Email Service (Required for OTP)
- Enable 2FA on your Gmail account
- Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
- Use your Gmail email and the generated app password

#### For AI Features (Optional but recommended)
- Get an OpenAI API key: [platform.openai.com](https://platform.openai.com)
- Or configure with Google AI (Gemini) - see the backend code

#### JWT Secret (Required)
- Generate a secure random string
- Example: `openssl rand -base64 32`

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check that your frontend URL is in the backend's `allowedOrigins`
   - Verify the backend `FRONTEND_URL` environment variable

2. **Database Connection Issues**
   - Verify your MongoDB connection string
   - Check if your IP is whitelisted in MongoDB Atlas
   - Test the connection string locally

3. **Email Not Sending**
   - Verify Gmail credentials
   - Check if 2FA is enabled and app password is used
   - Test email service locally

4. **AI Features Not Working**
   - Check OpenAI API key
   - Verify API key has sufficient credits
   - Check API endpoint configurations

### Testing Your Deployment:

1. **Backend Health Check**: Visit your Render URL
2. **Frontend**: Visit your Vercel URL
3. **Full Integration**: Try signing up with email verification
4. **API Endpoints**: Test authentication and AI features

## 🔒 Security Notes

- Never commit `.env` files
- Use strong, unique JWT secrets
- Enable HTTPS in production (automatic on Vercel/Render)
- Regularly rotate API keys and passwords
- Monitor your API usage and costs

## 📱 Mobile Responsiveness

The frontend is already optimized for mobile devices with responsive design.

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:
- **Vercel**: Automatically deploys on every push to main branch
- **Render**: Can be configured for auto-deploy on git push

## 📊 Monitoring

- **Render**: Provides logs and metrics in the dashboard
- **Vercel**: Provides analytics and performance metrics
- **MongoDB Atlas**: Provides database monitoring

---

**After successful deployment, your HiveMind collaborative code editor will be live and accessible to users worldwide! 🎉**