/*
 * Webhook route for WhatsApp Business API
 */
var express = require('express');
var router = express.Router();

const messageStore = require('../messageStore');

// GET verification endpoint
router.get('/', function(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  return res.sendStatus(400);
});

// POST endpoint to receive incoming messages
router.post('/', function(req, res) {
  const body = req.body;
  if (body && body.object === 'whatsapp_business_account') {
    // Iterate over entry changes
    body.entry.forEach(entry => {
      const changes = entry.changes || [];
      changes.forEach(change => {
        if (change.value && change.value.messages) {
          change.value.messages.forEach(message => {
            const from = message.from; 
            const text = message.text && message.text.body ? message.text.body : '';
            const msgObj = messageStore.addMessage({
              id: message.id || Date.now(),
              content: text,
              is_incoming: true,
              created_at: new Date().toISOString(),
              from: from
            });
            console.log('Received WhatsApp message saved to store:', msgObj);

            // Emit via socket.io if available
            const io = req.app.get('socketio');
            if (io) {
              console.log('Emitting new_message to frontend:', msgObj);
              io.emit('new_message', msgObj);
            }
          });
        }
      });
    });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Endpoint to retrieve stored messages
router.get('/history', function(req, res) {
  res.json([]); // This endpoint is moved to /api/messages/history
});

module.exports = router;
