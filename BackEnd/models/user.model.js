const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'] },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationOTP: { type: String },
    emailOTPExpiry: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Hash OTP before saving
userSchema.methods.setOTP = async function(otp) {
    const salt = await bcrypt.genSalt(10);
    this.emailVerificationOTP = await bcrypt.hash(otp, salt);
    this.emailOTPExpiry = Date.now() + 300000; // 5 minutes
};

// Compare OTP securely
userSchema.methods.compareOTP = async function(enteredOTP) {
    if (!this.emailVerificationOTP || this.emailOTPExpiry < Date.now()) {
        return false;
    }
    return await bcrypt.compare(enteredOTP, this.emailVerificationOTP);
};

const User = mongoose.model('User', userSchema);
module.exports = User;