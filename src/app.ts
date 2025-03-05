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
import {
  messageHandler,
  getMessages,
  Message,
} from "./controllers/messageController.js";
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
// app.use(messageRouter);

const onlineUsers = new Map<string, WebSocket>();
app.ws("/message", async (ws, req) => {
  try {
    console.log("WebSocket connection initiated");

    const token = req.headers["x-auth-token"];
    if (!token) {
      ws.send("No token provided");
      console.log("No token provided, closing WS");
      ws.close();
      return;
    }

    console.log("Token present");

    let decoded;
    try {
      decoded = jwt.verify(
        token as string,
        process.env.SECRET_KEY as string
      ) as {
        username: string;
        id: string;
      };
    } catch (err) {
      console.log("Token verification failed:", err);
      ws.send("Invalid token");
      ws.close();
      return;
    }

    console.log("Token verified");

    const username = decoded.username;
    const user = await prisma.users.findUnique({
      where: { username: username },
    });

    if (!user) {
      console.log("No user found in DB, closing WS");
      ws.send("No user found");
      ws.close();
      return;
    }

    console.log(`User ${username} found in DB, adding to onlineUsers`);
    onlineUsers.set(username, ws);

    const pendingMessages = await getMessages(username);
    for (const msg of pendingMessages) {
      ws.send(JSON.stringify(msg));
      await prisma.chats.update({
        where: { message_id: msg.message_id },
        data: { is_sent: true },
      });
    }

    ws.on("message", async (msg: string) => {
      try {
        const message: Message = JSON.parse(msg);
        console.log(`Received message from ${username}`);
    
        if (message.sender !== username) {
          console.log(`Unauthorized message attempt from ${message.sender}`);
          ws.send(process.pid);
          return;
        }
    
        if (!onlineUsers.has(message.reciever)) { 
          console.log(`Receiver ${message.reciever} is offline, storing message`);
          await messageHandler(message, false);
          // return;
        }
    
        console.log(`Receiver ${message.reciever} is online, delivering message`);
        const created_msg = await messageHandler(message, true);
    
        if (!created_msg) {
          console.log("Message handler did not return a valid message");
          return;
        }
    
        console.log("Created message:", created_msg);
    
        const receiverWs = onlineUsers.get(message.reciever);

        if (receiverWs) {
          receiverWs.send(JSON.stringify(created_msg));
        } 
        
        
        // Send confirmation back to the sender with both IDs
        const confirmationMessage = { 
          "newId": created_msg.message_id, 
          "oldId": message.message_id 
        };
        console.log("Sending confirmation:", confirmationMessage);
        ws.send(JSON.stringify(confirmationMessage));
      } catch (err) {
        console.log("Error processing message:", err);
        ws.send("Error processing message");
      }
    });
    

    ws.on("close", (code, reason) => {
      console.log(
        `WebSocket closed for ${username}: Code ${code}, Reason ${reason}`
      );
      onlineUsers.delete(username);
    });

    ws.on("error", (err) => {
      console.error(`WebSocket error for ${username}:`, err);
    });
  } catch (error) {
    console.error("WebSocket setup failed:", error);
    ws.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
