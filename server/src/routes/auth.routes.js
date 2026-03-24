import express from "express";
import passport from "passport";
import { googleCallback } from "../controllers/authController.js";
import {
  register,
  login,
  logoutResident,
} from "../controllers/residentAuth.controller.js";
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/admin/login",
  }),
  googleCallback,
);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logoutResident);

export default router;
