import prisma from '../config/prisma.js';
import { sendTextMessage, sendInteractiveMessage } from '../services/whatsappService.js';

// @desc    Send WhatsApp message
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { recipientPhone, content, campaign_id, contact_id } = req.body;

    // Validation
    if (!recipientPhone) {
      return res.status(400).json({
        message: 'Please provide recipient phone number'
      });
    }

    // Create message record in Prisma
    const message = await prisma.message.create({
      data: {
        campaign_id: campaign_id ? parseInt(campaign_id) : null,
        contact_id: contact_id ? parseInt(contact_id) : null,
        content: content || '',
        status: 'pending',
      },
    });

    // Send actual WhatsApp message
    let result;
    try {
      result = await sendTextMessage(recipientPhone, content);
    } catch (apiError) {
      console.error('WhatsApp API sending error detailed:', apiError.response?.data || apiError.message);
      // Update status to failed
      await prisma.message.update({
        where: { id: message.id },
        data: { status: 'failed' }
      });
      if (global.io) {
        global.io.emit('dashboard_update');
      }
      const errorMessage = apiError.response?.data?.error?.message || apiError.message;
      throw new Error(`WhatsApp API Error: ${errorMessage}`);
    }

    const updatedMessage = await prisma.message.update({
      where: { id: message.id },
      data: {
        status: 'sent',
        message_id: result.messages[0].id
      }
    });

    if (global.io) {
      global.io.emit('dashboard_update');
    }

    res.status(200).json({
      success: true,
      message: 'Message processed',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const sendInteractive = async (req, res) => {
  try {
    const { recipientPhone, interactiveType, headerText, bodyText, footerText, interactiveData } = req.body;

    if (!recipientPhone || !interactiveType) {
      return res.status(400).json({
        message: 'Please provide recipient phone number and interactiveType (list/button)'
      });
    }

    let interactiveObject = {
      type: interactiveType, // 'list' or 'button'
      header: headerText ? { type: "text", text: headerText } : undefined,
      body: { text: bodyText || "Please make a selection" },
      footer: footerText ? { text: footerText } : undefined,
      action: interactiveData // This should contain 'buttons' array or 'sections' array
    };

    // Clean undefined fields
    interactiveObject = JSON.parse(JSON.stringify(interactiveObject));

    // Create message record in Prisma
    const message = await prisma.message.create({
      data: {
        content: `[Interactive ${interactiveType}] ${bodyText}`,
        status: 'pending',
      },
    });

    let result;
    try {
      result = await sendInteractiveMessage(recipientPhone, interactiveObject);
    } catch (apiError) {
      console.error('WhatsApp API sending error detailed:', apiError.response?.data || apiError.message);
      await prisma.message.update({
        where: { id: message.id },
        data: { status: 'failed' }
      });
      if (global.io) {
        global.io.emit('dashboard_update');
      }
      const errorMessage = apiError.response?.data?.error?.message || apiError.message;
      throw new Error(`WhatsApp API Error: ${errorMessage}`);
    }

    const updatedMessage = await prisma.message.update({
      where: { id: message.id },
      data: {
        status: 'sent',
        message_id: result.messages[0].id
      }
    });

    if (global.io) {
      global.io.emit('dashboard_update');
    }

    res.status(200).json({
      success: true,
      message: 'Interactive message sent successfully',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Send interactive message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get message logs for current user
// @route   GET /api/messages/logs
// @access  Private
export const getMessageLogs = async (req, res) => {
  try {
    // Join with Campaign or Contact to ensure we only get logs for this user
    const logs = await prisma.message.findMany({
      where: {
        OR: [
          { campaign: { user_id: req.user.id } },
          { contact: { user_id: req.user.id } }
        ]
      },
      orderBy: { created_at: 'desc' },
      take: 50,
      include: {
        contact: {
          select: { name: true, phone: true }
        },
        campaign: {
          select: { name: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Webhook verification (GET)
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

// @desc    Webhook receiver (POST)
export const receiveWebhook = async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      // ... Webhook logic for Prisma ...
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
  }
};
