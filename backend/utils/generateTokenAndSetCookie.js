import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  // creating token for the user for 30 days
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // setting the token in the cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};
