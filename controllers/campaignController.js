import prisma from '../config/prisma.js';
import { processBulkCampaign } from '../services/bulkEngine.js';

export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { user_id: req.user.id },
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, template_name, group_name, scheduled_time } = req.body;

    const contacts = await prisma.contact.findMany({
      where: { user_id: req.user.id, group_name }
    });

    if (contacts.length === 0) {
      return res.status(400).json({ message: 'No contacts found in the specified group' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        template_name,
        scheduled_time: scheduled_time ? new Date(scheduled_time) : null,
        status: scheduled_time ? 'scheduled' : 'processing',
        user_id: req.user.id,
        messages: {
          create: contacts.map(c => ({
            contact_id: c.id,
            status: 'pending'
          }))
        }
      },
      include: { messages: true }
    });

    // If not scheduled (immediate), start processing in background
    if (campaign.status === 'processing') {
      processBulkCampaign(campaign.id).catch(err =>
        console.error(`Background campaign processing error for ${campaign.id}:`, err)
      );
    }

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCampaignAnalytics = async (req, res) => {
  try {
    const stats = await prisma.message.groupBy({
      by: ['status'],
      where: {
        campaign: { user_id: req.user.id }
      },
      _count: true
    });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
