import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const messages = await prisma.message.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
    });
    console.log('--- RECENT MESSAGES ---');
    messages.forEach(m => console.log(`ID: ${m.id} | Status: ${m.status} | Content: ${m.content} | WAMID: ${m.message_id?.substring(0, 15)}...`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
