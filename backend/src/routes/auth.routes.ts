import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  AuthController.register(req, res);
});

router.post("/login", (req: Request, res: Response) => {
  AuthController.login(req, res);
});

router.post("/logout", (req: Request, res: Response) => {
  AuthController.logout(req, res);
});

router.get("/validate", authenticate, (req: Request, res: Response) => {
  AuthController.validateToken(req, res);
});

export default router;
