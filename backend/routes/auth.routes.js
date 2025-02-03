import express from "express";
import {
  signup,
  login,
  logout,
  verifyEmail,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.get("/login", login);
router.get("/logout", logout);

router.post("/verify-email", verifyEmail);
export default router;
