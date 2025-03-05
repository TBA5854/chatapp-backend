import Express from "express";
import dotenv from "dotenv";
import session from "express-session";
import { connectDB } from "./helpers/dbController.js";
import { router as authRouter } from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoute.js";
import { authverify } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import ws from "express-ws";
import jwt from "jsonwebtoken";
import { messageHandler, getMessages, Message } from "./controllers/messageController.js";
import { prisma } from "./helpers/dbController.js";

dotenv.config();
connectDB();

const app = Express();
const expressWs = ws(app); // Attach WebSocket to `app`

app.use(Express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY!,
    resave: true,
    saveUninitialized: true,
  })
);

// Load routes
app.use(authRouter);
app.use("/users", authverify, userRouter);
app.use(messageRouter);

const onlineUsers = new Map<string, WebSocket>();

app.ws("/message", async (ws, req) => {
  const token = req.headers["x-auth-token"];
  if (!token) {
    ws.close();
    return;
  }

  try {
    const decoded = jwt.verify(token as string, process.env.SECRET_KEY as string) as {
      username: string;
      id: string;
    };
    if (!decoded || !decoded.username) {
      ws.close();
      return;
    }
    const username = decoded.username;
    const user = await prisma.users.findUnique({
      where: { username: username },
    });
    if (!user) {
      ws.close();
      return;
    }

    onlineUsers.set(username, ws);
    const pendingMessages = await getMessages(username);
    pendingMessages.forEach(async (msg) => {
      ws.send(JSON.stringify(msg));
      await prisma.chats.update({
        where: { message_id: msg.message_id },
        data: { is_sent: true },
      });
    });

    ws.on("message", async (msg: string) => {
      const message: Message = JSON.parse(msg);
      console.log(username, message.sender);
      if (message.sender !== username) {
        ws.send("Not Authorized");
        return;
      }

      if (!onlineUsers.has(message.reciever)) {
        await messageHandler(message, false);
        return;
      }

      const created_msg = await messageHandler(message, true);
      if (!created_msg) {
        return;
      }
      ws.send(JSON.stringify(created_msg));
    });

    ws.on("close", () => {
      onlineUsers.delete(username);
    });
  } catch (error) {
    console.error(error);
    ws.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
