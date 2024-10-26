import { prisma } from '../helpers/dbController.js';

export type Message = {
    message: string;
    sender: string;
    reciever: string;
    time: Date;
};

export async function messageHandler(msg: Message, isOnline: boolean): Promise<Message|void> {
    try {
        var { message, sender, reciever, time } = msg;
        if (!message || !sender || !reciever) {
            console.error('Invalid message data');
            return;
        }
        if (!time) {
            time = new Date();
        }
        const M=await prisma.chats.create({
            data: {
                message,
                sender,
                reciever,
                time,
                message_id: `${sender}-${reciever}-${time}`,
                is_sent: isOnline,
            },
        });
        //console.log(M);
        return M;
    } catch (error) {
        console.error(error);
    }

}

export async function getMessages(receiver: string): Promise<Message[]> {
    try {
        const messages = await prisma.chats.findMany({
            where: {
                reciever: receiver,
                is_sent: false,
            },
        });
        return messages;
    } catch (error) {
        console.error(error);
        return [];
    }
}


