import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const saltRounds = 10;
    
    // Create array of dummy users
    const users = [
        { username: 'johndoe', password: 'password123', name: 'John Doe' },
        { username: 'janedoe', password: 'password123', name: 'Jane Doe' },
        { username: 'bobsmith', password: 'password123', name: 'Bob Smith' },
        { username: 'alicesmith', password: 'password123', name: 'Alice Smith' },
        { username: 'mikebrown', password: 'password123', name: 'Mike Brown' },
        { username: 'sarahjones', password: 'password123', name: 'Sarah Jones' },
        { username: 'tomwilson', password: 'password123', name: 'Tom Wilson' },
        { username: 'emilydavis', password: 'password123', name: 'Emily Davis' },
        { username: 'davidmiller', password: 'password123', name: 'David Miller' },
        { username: 'oliviataylor', password: 'password123', name: 'Olivia Taylor' },
        { username: 'jameswilliams', password: 'password123', name: 'James Williams' },
        { username: 'sophiabrown', password: 'password123', name: 'Sophia Brown' },
        { username: 'williamjones', password: 'password123', name: 'William Jones' },
        { username: 'emmamiller', password: 'password123', name: 'Emma Miller' },
        { username: 'alexjohnson', password: 'password123', name: 'Alexander Johnson' },
        { username: 'oliviamartin', password: 'password123', name: 'Olivia Martin' },
        { username: 'noahwilson', password: 'password123', name: 'Noah Wilson' },
        { username: 'avadavis', password: 'password123', name: 'Ava Davis' },
        { username: 'liamtaylor', password: 'password123', name: 'Liam Taylor' },
        { username: 'isabellamoore', password: 'password123', name: 'Isabella Moore' },
        { username: 'loganthomas', password: 'password123', name: 'Logan Thomas' },
        { username: 'sophiaclark', password: 'password123', name: 'Sophia Clark' },
        { username: 'lucasrodriguez', password: 'password123', name: 'Lucas Rodriguez' },
        { username: 'charlottewalker', password: 'password123', name: 'Charlotte Walker' },
        { username: 'jacksonwhite', password: 'password123', name: 'Jackson White' },
    ];

    // Hash passwords and create users
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        await prisma.users.create({
            data: {
                username: user.username,
                password: hashedPassword,
                name: user.name,
                creation_time: new Date(),
            },
        });
    }

    console.log('Seeded database with users');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });