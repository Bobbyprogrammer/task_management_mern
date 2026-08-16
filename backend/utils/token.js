import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "development-secret-change-me";

export function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}
