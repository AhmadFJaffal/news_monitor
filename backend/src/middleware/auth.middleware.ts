import { cookieExtractor } from "../utils/helpers/token";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = cookieExtractor(req);

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      userId: number;
      username: string;
      exp: number; // Expiration timestamp
      iat: number; // Issued at timestamp
    };

    // Check if token is nearing expiration
    const timeUntilExpiry = decoded.exp - Math.floor(Date.now() / 1000);
    const renewalThreshold = 30 * 60; // 30 minutes in seconds

    if (timeUntilExpiry < renewalThreshold) {
      // Generate new token
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          username: decoded.username,
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "3h" }
      );

      // Set the new token as a cookie
      res.cookie("accessToken", newToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3 * 60 * 60 * 1000, // 3 hours
        sameSite: "none",
      });
    }

    req.user = {
      id: decoded.userId,
      username: decoded.username,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
