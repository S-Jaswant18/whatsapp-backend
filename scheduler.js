import cron from 'node-cron';
import prisma from './config/prisma.js';
import { processBulkCampaign } from './services/bulkEngine.js';

export const initScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        console.log('Running campaign scheduler...');
        try {
            const pendingCampaigns = await prisma.campaign.findMany({
                where: {
                    status: 'scheduled',
                    scheduled_time: {
                        lte: new Date()
                    }
                }
            });

            for (const campaign of pendingCampaigns) {
                console.log(`Starting scheduled campaign: ${campaign.name}`);
                processBulkCampaign(campaign.id);
            }
        } catch (error) {
            console.error('Scheduler error:', error);
        }
    });
};
