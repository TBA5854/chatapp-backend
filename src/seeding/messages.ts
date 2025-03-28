import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    const usernames = [
        'johndoe', 'janedoe', 'bobsmith', 'alicesmith', 'mikebrown',
        'sarahjones', 'tomwilson', 'emilydavis', 'davidmiller', 'oliviataylor',
        'jameswilliams', 'sophiabrown', 'williamjones', 'emmamiller', 'alexjohnson',
        'oliviamartin', 'noahwilson', 'avadavis', 'liamtaylor', 'isabellamoore',
        'loganthomas', 'sophiaclark', 'lucasrodriguez', 'charlottewalker', 'jacksonwhite'
    ];

    const messageTemplates = [
        "Hey there! How are you doing?",
        "Did you watch the game last night?",
        "Can we meet for coffee tomorrow?",
        "Have you finished the project yet?",
        "Happy birthday! 🎂",
        "Thanks for the help earlier!",
        "What time is the meeting?",
        "I sent you the documents via email.",
        "Are you free this weekend?",
        "Can you please review my pull request?",
        "The presentation went really well!",
        "Don't forget about our dinner plans.",
        "I really enjoyed our conversation yesterday.",
        "Looking forward to seeing you soon!",
        "Could you share the notes from class?",
        "How was your vacation?",
        "Just checking in, how are things going?",
        "Did you get my previous message?",
        "We need to talk about the upcoming event.",
        "Let me know when you're available."
    ];

    const messages = [];
    const now = new Date();
    
    // Generate 120 messages
    for (let i = 0; i < 120; i++) {
        const randomSenderIndex = Math.floor(Math.random() * usernames.length);
        let randomReceiverIndex = Math.floor(Math.random() * usernames.length);
        
        // Make sure sender and receiver are different
        while (randomReceiverIndex === randomSenderIndex) {
            randomReceiverIndex = Math.floor(Math.random() * usernames.length);
        }
        
        const sender = usernames[randomSenderIndex];
        const receiver = usernames[randomReceiverIndex];
        const messageIndex = Math.floor(Math.random() * messageTemplates.length);
        
        // Random date within the last 30 days
        const randomTime = new Date(now.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
        
        messages.push({
            sender: sender,
            reciever: receiver,
            message: messageTemplates[messageIndex],
            time: randomTime,
            message_id: `${sender}-${receiver}-${randomTime}`,
            is_sent: Math.random() > 0.05 // 5% chance of unsent messages
        });
    }
        console.log(messages)
    // // Sort messages by time
    messages.sort((a, b) => a.time.getTime() - b.time.getTime());
    
    // // Create messages in database
    await prisma.chats.createMany({
        data: messages
    });
    
    console.log(`Seeded database with ${messages.length} messages`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });