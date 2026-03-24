import {
  registerResident,
  loginResident,
} from "../services/residentAuth.service.js";

import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const user = await registerResident(req.body);

    res.status(201).json({
      message: "Registration submitted. Wait for admin approval.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const user = await loginResident(req.body);

    const token = generateToken(user.id);

    res.cookie("user-token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: false,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const logoutResident = (req, res) => {
  res.clearCookie("user-token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Logged out" });
};
