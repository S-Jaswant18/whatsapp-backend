import express from 'express';
import { getCampaigns, createCampaign, getCampaignAnalytics } from '../controllers/campaignController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getCampaigns);
router.post('/', auth, createCampaign);
router.get('/analytics', auth, getCampaignAnalytics);

export default router;
