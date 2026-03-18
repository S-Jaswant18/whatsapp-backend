import express from 'express';
import { getRules, createRule, deleteRule } from '../controllers/chatbotController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getRules);
router.post('/', auth, createRule);
router.delete('/:id', auth, deleteRule);

export default router;
