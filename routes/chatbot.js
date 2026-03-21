const express = require('express');
const router = express.Router();

// Mock data for chatbot rules
let chatbotRules = [
  { id: 1, trigger_keyword: 'hello', reply_template: 'welcome_template' },
  { id: 2, trigger_keyword: 'help', reply_template: 'support_template' }
];

// GET /api/chatbot
router.get('/', (req, res) => {
  res.json(chatbotRules);
});

// POST /api/chatbot
router.post('/', (req, res) => {
  const { trigger_keyword, reply_template } = req.body;
  const newRule = { id: Date.now(), trigger_keyword, reply_template };
  chatbotRules.push(newRule);
  res.status(201).json(newRule);
});

// DELETE /api/chatbot/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  chatbotRules = chatbotRules.filter(rule => rule.id !== id);
  res.json({ success: true });
});

module.exports = router;
