/* Mock contacts route */
var express = require('express');
var router = express.Router();

const contacts = [
  { id: 1, name: 'My Local Test', phone: process.env.RECIPIENT_WAID || '911234567890' },
  { id: 2, name: 'Jane Smith', phone: '910987654321' }
];

router.get('/', function(req, res) {
  res.json(contacts);
});

router.post('/', function(req, res) {
  const { name, phone, group_name } = req.body;
  const newContact = { id: Date.now(), name, phone, group_name, created_at: new Date().toISOString() };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

module.exports = router;
