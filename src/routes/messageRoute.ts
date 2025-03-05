import express from 'express';
import { messageHandler, Message, getMessages } from '../controllers/messageController.js';
import { prisma } from '../helpers/dbController.js';
import ws from 'express-ws';
import jwt from 'jsonwebtoken';
const router = express.Router();
ws(router);
const onlineUsers = new Map<string, WebSocket>();

router.ws('/message', async (ws, req) => {
    const token = req.headers['x-auth-token'];
    
    if (!token) {
        ws.close();
        return;
    }
    
    try {
        const decoded = jwt.verify(token as string, process.env.SECRET_KEY as string) as { username: string, id: string };
        if (!decoded || !decoded.username) {
            ws.close();
            return;
        }
        const username = decoded.username;
        const user = await prisma.users.findUnique({
            where: {
                username: username
            }
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
                where: {
                    message_id: msg.message_id,
                },
                data: {
                    is_sent: true,
                },
            });
        });
        
        ws.on("message", async (msg: string) => {
            const message: Message = JSON.parse(msg);
            console.log(username,message.sender)
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

export default router;