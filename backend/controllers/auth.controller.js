import bcrypt from "bcryptjs";
import crypto from "crypto";

import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/email.js";
import { User } from "../models/user.model.js";

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth : ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const signup = async (req, res) => {
  // console.log(req.body)
  // res.send("signup controller");
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All feilds are required");
    }
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    // saving user in the database
    await user.save();

    // jwt token
    const token = generateTokenAndSetCookie(res, user._id);

    // send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created",
      user: {
        ...user._doc,
        password: undefined,
        verificationToken: verificationToken,
        verificationTokenExpiresAt: user.verificationTokenExpiresAt,
        token: token,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  //  1 2 3 4 5 6
  const { code } = req.body;
  console.log(code);

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    // console.log(user)
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
      return;
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    // console.log("user", user);
    await user.save();

    // await sendWelcomeEmail(user.email, user.name);
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log("Error while verifying email", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "user doesn't exists",
      });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).json({
        success: false,
        message: "Invalid credentials!",
      });
      return;
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "user logged in successfully!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "user doesn't exists",
      });
      return;
    }

    // generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send reset password email
    await sendPasswordResetEmail(
      email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(200).json({
      success: true,
      message: "reset password mail sent to your email",
    });
  } catch (error) {
    console.log("error in forgot password : ", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "invalid token",
      });
      return;
    }
    // update password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    // console.log("user", user);
    await user.save();

    // send email
    await sendResetSuccessEmail(user.email);
    res.status(200).json({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    console.log("error in reset password : ", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
