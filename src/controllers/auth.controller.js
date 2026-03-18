import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import authRouter from "../routes/auth.routes.js";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const isAlreadyExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isAlreadyExist) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save(); // ✅ IMPORTANT

    const accessToken = jwt.sign(
      { id: newUser._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
      },
      accessToken,

    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

export async function getMe(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel
      .findById(decoded.id)
      .select("username email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
      message: "User fetched successfully",
    });

  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "No refresh token provided",
      });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    

    res.status(200).json({
      accessToken: newAccessToken,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};