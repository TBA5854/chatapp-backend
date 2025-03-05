import { Router } from "express";
import { login, logout, signin } from "../controllers/authController.js"

export const router: Router = Router();

router.get('/logout', logout);
router.post('/login', login);
router.post('/signin', signin);