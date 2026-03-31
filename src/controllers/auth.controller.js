import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Session from "../models/session.model.js";


// ================= REGISTER =================
export async function register(req, res) {

  try {
    const { username, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyRegistered) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    // ✅ Generate Refresh Token
    const refreshToken = jwt.sign(
      { id: newUser._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Hash Refresh Token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // ✅ Create Session
    const session = await Session.create({
      user: newUser._id,
      refreshToken: refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // ✅ Access Token with sessionId
    const accessToken = jwt.sign(
      { id: newUser._id, sessionId: session._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
    res.status(500).json({ message: error.message });
  }
}

// ================= LOGIN =================

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Generate Refresh Token
    const refreshToken = jwt.sign(
      { id: user._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Hash Refresh Token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // ✅ Create Session
    const session = await Session.create({
      user: user._id,
      refreshToken: refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // ✅ Access Token with sessionId
    const accessToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure:true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Logged in successfully",      
      user: {
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


// ================= GET ME =================
export async function getMe(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}


// ================= REFRESH TOKEN =================
export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    // 🔍 Find all sessions of user
    const sessions = await Session.find({
      user: decoded.id,
      revoked: false,
    });

    let validSession = null;

    // ✅ Compare using bcrypt.compare (FIXED)
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.refreshToken
      );

      if (isMatch) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // ✅ Generate new tokens
    const accessToken = jwt.sign(
      { id: decoded.id, sessionId: validSession._id },
      config.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Hash new refresh token
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    // ✅ Update session (FIXED field name)
    validSession.refreshToken = newRefreshTokenHash;
    await validSession.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}


// ================= LOGOUT =================
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔍 Find all sessions
    const sessions = await Session.find({ revoked: false });

    let validSession = null;

    // ✅ Compare instead of hashing (FIXED)
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(
        refreshToken,
        session.refreshToken
      );

      if (isMatch) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Revoke session
    validSession.revoked = true;
    await validSession.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ================= LOGOUT ALL SESSIONS =================
export async function logoutAll(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);  


    // 🔍 Find all sessions of user

    await Session.updateMany({
      user: decoded.id,
      revoked: false,
    }, {
      revoked: true,
    })

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out from all sessions successfully",
    });
  }

    catch (error) {
    res.status(500).json({ message: error.message });
  }
} 

