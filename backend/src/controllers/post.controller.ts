import { Request, Response } from "express";
import { PostService } from "../services/post.service";
import { createPostSchema, updatePostSchema } from "../types/index";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class PostController {
  private static postService = new PostService();

  public static async createPost(req: Request, res: Response) {
    try {
      const validatedData = createPostSchema.parse(req.body);
      const post = await this.postService.createPost(validatedData);
      return res.status(201).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
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

  public static async getAllPosts(req: Request, res: Response) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const searchTerm = req.query.search?.toString();

      const posts = searchTerm
        ? await this.postService.searchPosts(searchTerm, page, limit)
        : await this.postService.findAll(page, limit);

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public static async getPostById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const post = await this.postService.findById(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public static async updatePost(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      const validatedData = updatePostSchema.parse(req.body);

      const post = await this.postService.updatePost(id, validatedData);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      return res.status(200).json(post);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res.status(404).json({ error: "Post not found" });
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

  public static async deletePost(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid post ID" });
      }

      await this.postService.deletePost(id);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res.status(404).json({ error: "Post not found" });
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
