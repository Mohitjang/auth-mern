import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/email.js";

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
export const login = async (req, res) => {
  res.send("login controller");
};
export const logout = async (req, res) => {
  res.send("logout controller");
};
