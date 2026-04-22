//User.js

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  
  resetToken: String,
  resetTokenExpiry: Date,
  
  role: { type: String, enum: ["user", "admin"], default: 'user' }

}, { timestamps: true });

export default mongoose.model('User', userSchema);