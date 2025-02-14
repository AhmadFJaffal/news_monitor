import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import {
  createUserSchema,
  loginSchema,
  updateUserSchema,
} from "../types/index";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { setAccessToken, clearAccessToken } from "../utils/helpers/token";

export class UserController {
  private static userService = new UserService();
  private static authService = new AuthService();

  public static async register(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);

      const existingUser = await this.userService.findByUsername(
        validatedData.username
      );
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await this.userService.createUser(validatedData);

      // Set the access token as an HTTP-only cookie
      await setAccessToken(res, user);

      return res.status(200).json({ user: user });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res.status(400).json({ error: "Username already exists" });
        }
        return res.status(400).json({
          error: "Database error",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await this.userService.findByUsername(
        validatedData.username
      );

      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(
        validatedData.password,
        user.password
      );

      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set the access token as an HTTP-only cookie
      await setAccessToken(res, user);

      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Add a logout method
  public static async logout(req: Request, res: Response) {
    clearAccessToken(res);
    return res.status(200).json({ message: "Logged out successfully" });
  }

  public static async validateToken(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await this.authService.validateUserSession(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
          error: "Database error",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await this.userService.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return res.status(400).json({
          error: "Database error",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = updateUserSchema.parse(req.body);

      if (validatedData.username) {
        const existingUser = await this.userService.findByUsername(
          validatedData.username
        );
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      const user = await this.userService.updateUser(userId, validatedData);
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return res.status(400).json({ error: "Username already taken" });
        }
        return res.status(400).json({
          error: "Database error",
          message: error.message,
        });
      }
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
