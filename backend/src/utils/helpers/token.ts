import { Response } from "express";
import jwt from "jsonwebtoken";

interface User {
  id: number;
  role?: string;
  update?: (data: { token_in_use: string }) => Promise<void>;
}

/**
 * Sets an access token as an HTTP-only cookie and updates the user's token_in_use field
 */
export const setAccessToken = async (
  res: Response,
  user: User
): Promise<void> => {
  try {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        userRole: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "3h" }
    );

    // If the user model has a token_in_use field, update it
    if (user.update) {
      await user.update({ token_in_use: accessToken });
    }

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
      sameSite: "none",
    });
  } catch (error) {
    console.error("Error in setAccessToken:", error);
    throw error;
  }
};

/**
 * Extracts the access token from cookies in the request
 */
export const cookieExtractor = (req: {
  cookies?: { [key: string]: string };
}): string | null => {
  if (req && req.cookies) {
    return req.cookies["accessToken"] || null;
  }
  return null;
};

/**
 * Clears the access token cookie
 */
export const clearAccessToken = (res: Response): void => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
    sameSite: "none",
  });
};

export interface JWTPayload {
  userId: number;
  userRole?: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies and decodes the JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key"
  ) as JWTPayload;
};
