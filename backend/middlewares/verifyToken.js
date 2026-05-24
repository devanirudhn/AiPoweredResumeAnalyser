import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const { verify } = jwt;

export const verifyToken = (req, res, next) => {
  try {
    // get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = verify(token, process.env.SECRET_KEY);

    // attach user
    req.user = decoded;

    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};