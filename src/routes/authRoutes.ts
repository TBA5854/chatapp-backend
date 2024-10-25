import { Router } from "express";
import { login, logout } from "../controllers/authController.js"
import passport from "passport";
import jwt from "jsonwebtoken";

export const router: Router = Router();

router.get('/logout', logout);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/auth/google' }), (req, res) => {
    const token = jwt.sign({ id: req.user!.profile.id }, process.env.SECRET_KEY as string);
    res.cookie('X-Auth-Token', token, { expires: new Date(Date.now() + 8 * 3600000) });

    login(req, res);
});