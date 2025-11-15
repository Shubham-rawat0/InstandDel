import type{ Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}


const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Token not found, please login again" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("No JWT secret configured");
    }
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    if (!decodedToken?.userId) {
      return res
        .status(400)
        .json({ message: "Invalid token, please login again" });
    }
    req.userId = decodedToken.userId;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res
      .status(500)
      .json({ message: "Unauthorized: invalid or expired token" });
  }
};

export default isAuth;
