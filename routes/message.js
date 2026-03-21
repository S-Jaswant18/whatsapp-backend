/*
 * Route to send WhatsApp messages via the helper
 */
var express = require('express');
var router = express.Router();
var messageHelper = require('../messageHelper');
const messageStore = require('../messageStore');

// POST /send - matches frontend call from Chat.jsx
router.post('/send', async function(req, res) {
  try {
    const { recipientPhone, content, contact_id } = req.body;
    if (!recipientPhone || !content) {
      return res.status(400).json({ success: false, error: 'recipientPhone and content are required' });
    }
    const payload = messageHelper.getTextMessageInput(recipientPhone, content);
    console.log('Sending message to', recipientPhone, 'with content', content);
    const response = await messageHelper.sendMessage(payload);
    
    // Persist outgoing message
    messageStore.addMessage({
      content: content,
      is_incoming: false,
      to: recipientPhone,
      created_at: new Date().toISOString()
    });
    
    // Respond with consistent format expected by frontend
    res.json({
      success: true,
      data: {
        message_id: response.data.messages && response.data.messages[0].id ? response.data.messages[0].id : 'mock_id_' + Date.now()
      }
    });
  } catch (err) {
    console.error('Error sending message:', err.response ? err.response.data : err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /history/:phone
router.get('/history/:phone', (req, res) => {
  const history = messageStore.getHistory(req.params.phone);
  res.json(history);
});

module.exports = router;
