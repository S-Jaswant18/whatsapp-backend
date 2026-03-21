/* Mock authentication route */
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

// Mock user store (use real DB for production!)
const users = [];

// POST /register
router.post('/register', async function(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), username, email, password: hashedPassword };
    users.push(user);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /login
router.post('/login', async function(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = users.find(u => u.email === email);
    // For demo/mock, if user not found, create one (autologin for test)
    if (!user) {
        // Mock a user for demo purposes if store is empty
        const mockPass = await bcrypt.hash(password, 10);
        const mockUser = { id: Date.now(), username: email.split('@')[0], email, password: mockPass };
        users.push(mockUser);
        const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, user: { id: mockUser.id, username: mockUser.username, email: mockUser.email } });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /me
router.get('/me', function(req, res) {
  res.json({ user: users[0] || null }); // simplified for demo
});

module.exports = router;
