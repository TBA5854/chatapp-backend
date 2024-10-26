import express from 'express';
import { messageHandler, Message, getMessages } from '../controllers/messageController.js';
import { prisma } from '../helpers/dbController.js';
import ws from 'express-ws';
import jwt from 'jsonwebtoken';
const router = express.Router();
ws(router);
const onlineUsers = new Map<string, WebSocket>();
router.ws('/message', async (ws, req) => {
    var tkn = req.headers['x-auth-token'];
    //console.log(req.headers);
    if (!tkn) {
        ws.close();
        return;
    }
    try {
        jwt.verify(tkn as string, process.env.SECRET_KEY as string, async (err: any, decodedtoken: any) => {
            var token = decodedtoken.id;
            const uid = await prisma.google.findUnique({
                where: {
                    access_token: token as string
                }
            });
            token = uid!.gid;
            if (!uid) {
                ws.close();
                return;
            }
            const user = await prisma.users.findUnique({
                where: {
                    id: token
                }
            });
            if (!user) {
                ws.close();
                return;
            }
            onlineUsers.set(user.username, ws);
            //console.log("connected");
            const pendingMessages = await getMessages(user.username);
            pendingMessages.forEach(async (msg) => {
                ws.send(JSON.stringify(msg));
                //console.log(msg);
                await prisma.chats.update({
                    where: {
                        message_id: msg.message_id,//id
                    },
                    data: {
                        is_sent: true,
                    },
                });
            });
            ws.on("message", async (msg: string) => {
                // console.log(onlineUsers);
                const message: Message = JSON.parse(msg);
                // console.log(message);
                if (message.sender != user.username) {
                    ws.send("Not Authorised");
                    return;
                }
                if (!onlineUsers.has(message.reciever)) {
                    await messageHandler(message, false);
                    //console.log("user offline")
                    return;
                }
                const created_msg = await messageHandler(message, true);
                if (!created_msg) {
                    return;
                }
                ws.send(JSON.stringify(created_msg));
            });

            ws.on("close", () => {
                onlineUsers.delete(user.username);
                //console.log("disconnected");
            });
        });
    } catch (error) {
        console.error(error);
        ws.close();
    }
});

export default router;