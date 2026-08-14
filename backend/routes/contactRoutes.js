import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createContactMessage,
  getContactMessages,
} from '../controllers/contactController.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many messages. Please try again later.' },
});

router.post('/', contactLimiter, createContactMessage);
router.get('/', getContactMessages);

export default router;
