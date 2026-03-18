import express from 'express';
import { getContacts, createContact, uploadContactsCSV, deleteContact } from '../controllers/contactController.js';
import auth from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/csv/' });

router.get('/', auth, getContacts);
router.post('/', auth, createContact);
router.post('/upload', auth, upload.single('file'), uploadContactsCSV);
router.delete('/:id', auth, deleteContact);

export default router;
