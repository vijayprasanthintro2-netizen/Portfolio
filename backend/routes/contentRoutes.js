import { Router } from 'express';
import {
  getPublicContent,
  getSection,
  saveSection,
  resetSection,
} from '../controllers/contentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', getPublicContent);

// Admin (protected)
router.get('/:section', protect, getSection);
router.put('/:section', protect, saveSection);
router.delete('/:section', protect, resetSection);

export default router;
