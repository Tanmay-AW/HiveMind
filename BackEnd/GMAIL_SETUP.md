# Gmail SMTP Setup Guide

## Overview
This project now uses Nodemailer with Gmail SMTP for sending OTP verification emails.

## Setup Steps

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### 2. Generate App Password
1. In Google Account settings, go to "Security"
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Generate the app password
5. Copy the 16-character password (no spaces)

### 3. Environment Variables
Add the following to your `.env` file:
```
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

### 4. Install Dependencies
Run the following command in your BackEnd directory:
```bash
npm install
```

## Security Features

### ✅ Secure OTP Storage
- OTPs are hashed using bcrypt before storing in the database
- Plain text OTPs are never stored
- 5-minute expiration time for enhanced security

### ✅ Gmail Security
- Uses App Passwords instead of regular passwords
- 2-Factor Authentication required
- Secure SMTP connection

## Benefits of Gmail SMTP
- ✅ Reliable and trusted email service
- ✅ High deliverability rates
- ✅ Free for personal use
- ✅ Built-in spam protection
- ✅ Easy to set up and maintain

## Testing
After setup, test the email functionality by:
1. Starting your server
2. Creating a new user account
3. Check if the OTP email is received in the user's Gmail

## Troubleshooting

### Common Issues:
1. **"Invalid login" error**: Make sure you're using an App Password, not your regular Gmail password
2. **"Less secure app access" error**: Enable 2-Factor Authentication and use App Passwords
3. **Emails not sending**: Check your Gmail account for any security alerts
4. **OTP not working**: Ensure the OTP is entered within 5 minutes of generation

### Gmail Limits:
- Daily sending limit: 500 emails per day for regular Gmail accounts
- Rate limit: ~20 emails per minute

## Alternative Setup (if Gmail doesn't work)
If you encounter issues with Gmail, you can also use:
- Outlook/Hotmail SMTP
- Yahoo Mail SMTP
- Custom domain with SMTP service

Just update the transporter configuration in `services/email.service.js` accordingly. 