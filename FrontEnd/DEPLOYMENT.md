# HiveMind Frontend Deployment Guide

## Current Status
- ✅ Frontend deployed on Vercel: `https://hive-mind-puce.vercel.app`
- ⏳ Backend URL pending (will be updated when provided)

## Integration Steps

### 1. Update Backend URL
When you have your backend deployed, update the `config.js` file:

```javascript
// In FrontEnd/config.js
const CONFIG = {
    FRONTEND_URL: "https://hive-mind-puce.vercel.app",
    BACKEND_URL: "https://your-backend-url.com", // ← Update this line
    // ... rest of config
};
```

### 2. CORS Configuration
Ensure your backend has CORS configured to allow requests from:
```
https://hive-mind-puce.vercel.app
```

### 3. Environment Variables
Make sure your backend has all necessary environment variables:
- Database connection strings
- JWT secret
- Email service credentials
- AI service API keys

### 4. Test the Integration
1. Visit `https://hive-mind-puce.vercel.app`
2. Try to sign up/login
3. Test the AI features in the editor
4. Verify real-time collaboration works

## File Structure
```
FrontEnd/
├── config.js          # API configuration (UPDATE BACKEND URL HERE)
├── index.html         # Landing page with auth
├── app.html           # Main editor interface
├── script.js          # Authentication logic
├── editor.js          # Editor functionality
├── style.css          # Main styles
├── editor.css         # Editor-specific styles
└── DEPLOYMENT.md      # This file
```

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Check backend CORS configuration
2. **404 Errors**: Verify API endpoints match between frontend and backend
3. **Authentication Issues**: Check JWT token handling
4. **AI Features Not Working**: Verify AI service API keys

### Debug Steps:
1. Open browser developer tools
2. Check Network tab for failed requests
3. Check Console for JavaScript errors
4. Verify localStorage has correct tokens

## Next Steps
1. Deploy backend and provide URL
2. Update `config.js` with backend URL
3. Test all features
4. Configure custom domain if needed 