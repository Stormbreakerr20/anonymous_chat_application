import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserOTPVerificationSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

UserOTPVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserOTPVerification = mongoose.model(
  "UserOTPVerification",
  UserOTPVerificationSchema
);

export default UserOTPVerification;
