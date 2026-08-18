import { Router } from 'express';
import { login, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.put('/password', protect, changePassword);

export default router;
