import { Router, Request, Response } from "express";
import { PostController } from "../controllers/post.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, (req: Request, res: Response) => {
  PostController.createPost(req, res);
});

router.get("/", authenticate, (req: Request, res: Response) => {
  PostController.getAllPosts(req, res);
});

router.get("/:id", authenticate, (req: Request, res: Response) => {
  PostController.getPostById(req, res);
});

router.put("/:id", authenticate, (req: Request, res: Response) => {
  PostController.updatePost(req, res);
});

router.delete("/:id", authenticate, (req: Request, res: Response) => {
  PostController.deletePost(req, res);
});

export default router;
