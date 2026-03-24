import bcrypt from "bcrypt";
import { createUserModel, findUserByEmailModel } from "../models/user.model.js";

const err = (message, statusCode) => {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
};

export const registerResident = async ({ name, email, phone, password }) => {
  const n = String(name || "").trim();
  const em = String(email || "")
    .trim()
    .toLowerCase();
  const ph = phone != null ? String(phone).trim() : "";
  const pw = String(password || "");

  if (!n || !em || !pw) {
    throw err("name, email, and password are required", 400);
  }

  if (n.length < 2 || n.length > 80) {
    throw err("Name must be between 2 and 80 characters", 400);
  }

  if (!/^[a-zA-Z\s.'-]+$/.test(n)) {
    throw err("Name contains invalid characters", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    throw err("Invalid email format", 400);
  }

  if (ph && !/^[0-9]{10,15}$/.test(ph)) {
    throw err("Phone must be 10-15 digits", 400);
  }

  if (pw.length < 4 || pw.length > 15) {
    throw err("Password must be between 4 and 15 characters", 400);
  }

  const existing = await findUserByEmailModel(em);
  if (existing) throw err("Email already registered", 400);

  const passwordHash = await bcrypt.hash(pw, 10);

  return await createUserModel({
    name: n,
    email: em,
    phone: ph || null,
    passwordHash,
  });
};

/** Compare plain or bcrypt hash (seed data may store plain text). */
const passwordMatches = async (plain, passwordHash) => {
  if (!passwordHash) return false;

  const input = String(plain).trim();
  const hash = String(passwordHash).trim();

  const match = bcrypt.compareSync(input, hash);

  return match;
};

export const loginResident = async ({ email, password }) => {
  const em = String(email || "")
    .trim()
    .toLowerCase();
  const pw = String(password || "");

  if (!em || !pw) {
    throw err("Email and password are required", 400);
  }

  const user = await findUserByEmailModel(em);
  if (!user) throw err("Invalid user", 401);

  if (user.role !== "resident") {
    throw err("Invalid credentials", 401);
  }

  if (user.is_active === false) {
    throw err("Account is disabled", 403);
  }

  // console.log(user);

  const match = await passwordMatches(pw, user.password_hash);

  if (!match) throw err("Invalid password", 401);
  return user;
};
