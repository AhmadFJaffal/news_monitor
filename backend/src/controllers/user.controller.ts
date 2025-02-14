import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { updateUserSchema } from "../types/index";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class UserController {
  private static userService = new UserService();

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
