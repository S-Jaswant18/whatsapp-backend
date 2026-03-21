const fs = require('fs');
const path = require('path');

const STORAGE_FILE = path.join(__dirname, 'messages.json');

// Memory store
let messages = [];

// Load from file if exists
if (fs.existsSync(STORAGE_FILE)) {
  try {
    messages = JSON.parse(fs.readFileSync(STORAGE_FILE, 'utf8'));
    console.log('Loaded', messages.length, 'messages from storage.');
  } catch (err) {
    console.error('Error loading messages:', err);
  }
}

function save() {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Error saving messages:', err);
  }
}

function addMessage(msg) {
  const newMsg = {
    id: msg.id || Date.now() + Math.random(),
    content: msg.content,
    is_incoming: !!msg.is_incoming,
    created_at: msg.created_at || new Date().toISOString(),
    from: msg.from, // phone number for incoming
    to: msg.to     // phone number for outgoing
  };
  messages.push(newMsg);
  save();
  return newMsg;
}

function getHistory(phone) {
  // Return messages where either 'from' or 'to' matches the contact's phone
  return messages.filter(m => m.from === phone || m.to === phone);
}

module.exports = {
  addMessage,
  getHistory
};
