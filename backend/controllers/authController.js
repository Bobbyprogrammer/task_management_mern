import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/token.js";
import publicUser from "../utils/publicUser.js";

export async function register(req, res, next) {
  try {
    const { name = "", email = "", password = "" } = req.body;
    if (!name.trim() || !email.trim() || password.length < 6) {
      return res.status(400).json({ message: "Name, email, and a password of at least 6 characters are required." });
    }
    if (await User.exists({ email: email.toLowerCase().trim() })) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: await hashPassword(password),
    });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email = "", password = "" } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
}
