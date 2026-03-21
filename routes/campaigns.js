const express = require('express');
const router = express.Router();

// Mock data for campaigns
let campaigns = [
  { 
    id: 1, 
    name: 'Welcome Campaign', 
    template_name: 'welcome_template', 
    status: 'completed', 
    _count: { messages: 15 }, 
    created_at: new Date().toISOString() 
  }
];

// GET /api/campaigns
router.get('/', (req, res) => {
  res.json(campaigns);
});

// POST /api/campaigns
router.post('/', (req, res) => {
  const { name, template_name, group_name, scheduled_time } = req.body;
  const newCampaign = {
    id: Date.now(),
    name,
    template_name,
    group_name,
    status: 'scheduled',
    _count: { messages: 0 },
    scheduled_time,
    created_at: new Date().toISOString()
  };
  campaigns.push(newCampaign);
  res.status(201).json(newCampaign);
});

module.exports = router;
