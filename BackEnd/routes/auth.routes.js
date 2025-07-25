const express = require('express');
const router = express.Router();
const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service.js');
const authMiddleware = require('../middleware/auth.middleware.js');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
        
        let newUser = new User({ name, email, password });
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await newUser.setOTP(otp);
        
        await newUser.save();
        
        // Send OTP email to user
        const emailResult = await emailService.sendOTPEmail(email, otp);
        
        if (!emailResult.success) {
            // If email fails, still create user but inform about email issue
            console.error('Email sending failed:', emailResult.error);
            res.status(201).json({ success: true, message: 'User registered. Please check your email for verification code.' });
        } else {
            res.status(201).json({ success: true, message: 'User registered. Please check your email for verification code.' });
        }

    } catch (error) {
        console.error('--- SIGNUP FAILED ---', error); 
        res.status(500).json({ success: false, message: 'Server error during user creation.', error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please verify your email first. Check your inbox for the verification code.' 
            });
        }
        
        const payload = { id: user._id, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ success: true, token, name: user.name, email: user.email });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.compareOTP(otp))) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        
        user.isEmailVerified = true;
        user.emailVerificationOTP = undefined;
        user.emailOTPExpiry = undefined;
        await user.save();
        
        const payload = { id: user._id, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ success: true, message: 'Email verified successfully!', token, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }
        
        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await user.setOTP(otp);
        await user.save();
        
        // Send new OTP email
        const emailResult = await emailService.sendOTPEmail(email, otp);
        
        if (!emailResult.success) {
            console.error('Email sending failed:', emailResult.error);
            res.json({ success: true, message: 'OTP resent. Please check your email.' });
        } else {
            res.json({ success: true, message: 'OTP resent successfully!' });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;