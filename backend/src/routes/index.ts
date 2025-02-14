import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { PostController } from "../controllers/post.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Auth routes
router.post("/auth/register", (req: Request, res: Response) => {
  UserController.register(req, res);
});

router.post("/auth/login", (req: Request, res: Response) => {
  UserController.login(req, res);
});

router.post("/auth/logout", (req: Request, res: Response) => {
  UserController.logout(req, res);
});

router.get("/auth/validate", authenticate, (req: Request, res: Response) => {
  UserController.validateToken(req, res);
});

// User routes
router.get("/profile", authenticate, (req: Request, res: Response) => {
  UserController.getProfile(req, res);
});

router.put("/profile", authenticate, (req: Request, res: Response) => {
  UserController.updateProfile(req, res);
});

// Post routes
router.post("/posts", authenticate, (req: Request, res: Response) => {
  PostController.createPost(req, res);
});

router.get("/posts", authenticate, (req: Request, res: Response) => {
  PostController.getAllPosts(req, res);
});

router.get("/posts/:id", authenticate, (req: Request, res: Response) => {
  PostController.getPostById(req, res);
});

router.put("/posts/:id", authenticate, (req: Request, res: Response) => {
  PostController.updatePost(req, res);
});

router.delete("/posts/:id", authenticate, (req: Request, res: Response) => {
  PostController.deletePost(req, res);
});

export default router;
