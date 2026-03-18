import prisma from '../config/prisma.js';
import { sendTemplateMessage } from './whatsappService.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processBulkCampaign = async (campaignId) => {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            user: true,
            messages: {
                include: { contact: true }
            }
        }
    });

    if (!campaign || campaign.status !== 'scheduled' && campaign.status !== 'processing') {
        return;
    }

    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'processing' }
    });

    const messages = await prisma.message.findMany({
        where: { campaign_id: campaignId, status: 'pending' },
        include: { contact: true }
    });

    for (const message of messages) {
        try {
            if (!message.contact?.phone) continue;

            const result = await sendTemplateMessage(message.contact.phone, campaign.template_name);

            await prisma.message.update({
                where: { id: message.id },
                data: {
                    message_id: result.messages[0].id,
                    status: 'sent'
                }
            });

            // Avoid rate limits - delay between messages (e.g., 2 seconds)
            await delay(2000);
        } catch (error) {
            console.error(`Failed to send message to ${message.contact?.phone}:`, error.message);
            await prisma.message.update({
                where: { id: message.id },
                data: { status: 'failed' }
            });
        }
    }

    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'completed' }
    });
};
