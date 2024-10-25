import Express from "express";
import dotenv from "dotenv";
import passport from 'passport'
import session from 'express-session'
import init from "./helpers/passportController.js"
import { connectDB } from "./helpers/dbController.js";
import {router as authRouter} from './routes/authRoutes.js'
import  userRouter from './routes/userRoutes.js'
import  messageRouter from './routes/messageRoute.js'
import { authverify } from "./middleware/authMiddleware.js";
import ws from "express-ws";
import cookieParser from "cookie-parser";

const app = Express();

dotenv.config();
connectDB();

ws(app);
init();
app.use(Express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(session({
    secret: process.env.SECRET_KEY!,
    resave: true,
    saveUninitialized: true
}))
const PORT = process.env.PORT || 3000;
app.use(authRouter);
app.use(messageRouter);
app.use("/users",authverify,userRouter);
app.listen(PORT, () => {
    console.log("Server is running on port 3000");
});