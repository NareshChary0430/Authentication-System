import mongoose from "mongoose";
const userSchema = new mongoose.Schema({

  username:{
    type:String,
    required:[true,"Username is required"],
    unique:[true,"Username must be unique"],
  },
  email:{
    type:String,
    required:[true,"Email is required"],
    unique:[true,"Email must be unique"],
  },
  password:{
    type:String,
    required:[true,"Password is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
}, { timestamps: true });

const userModel = mongoose.model("users",userSchema);
export default userModel;