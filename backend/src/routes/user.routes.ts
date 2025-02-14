import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, (req: Request, res: Response) => {
  UserController.getProfile(req, res);
});

router.put("/", authenticate, (req: Request, res: Response) => {
  UserController.updateProfile(req, res);
});

export default router;
