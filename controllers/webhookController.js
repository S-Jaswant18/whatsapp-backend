import prisma from '../config/prisma.js';
import dotenv from 'dotenv';
import { sendTextMessage } from '../services/whatsappService.js';

dotenv.config();

export const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

export const receiveWebhook = async (req, res) => {
    try {
        const body = req.body;

        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const message = body.entry[0].changes[0].value.messages[0];
                const from = message.from;
                const msgBody = message.text.body;
                const messageId = message.id;

                console.log(`Incoming message from ${from}: ${msgBody}`);

                // 1. Find or create contact
                let contact = await prisma.contact.findFirst({
                    where: { phone: from }
                });

                // 2. Store incoming message
                await prisma.message.create({
                    data: {
                        contact_id: contact?.id,
                        message_id: messageId,
                        content: msgBody,
                        status: 'delivered',
                        is_incoming: true
                    }
                });

                // 3. Chatbot Logic
                if (contact) {
                    const rules = await prisma.chatbotRule.findMany({
                        where: { user_id: contact.user_id }
                    });

                    for (const rule of rules) {
                        if (msgBody.toLowerCase().includes(rule.trigger_keyword.toLowerCase())) {
                            await sendTextMessage(from, rule.reply_template);
                            break;
                        }
                    }
                }

                // 4. Update Socket.io (to be implemented in server.js)
                if (global.io) {
                    global.io.emit('new_message', { from, body: msgBody, messageId });
                    global.io.emit('dashboard_update');
                }
            }

            // Handle Status Updates
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.statuses &&
                body.entry[0].changes[0].value.statuses[0]
            ) {
                const statusUpdate = body.entry[0].changes[0].value.statuses[0];
                const msgId = statusUpdate.id;
                const status = statusUpdate.status; // delivered, read, failed

                await prisma.message.updateMany({
                    where: { message_id: msgId },
                    data: { status }
                });

                if (global.io) {
                    global.io.emit('status_update', { messageId: msgId, status });
                    global.io.emit('dashboard_update');
                }
            }

            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.sendStatus(500);
    }
};
