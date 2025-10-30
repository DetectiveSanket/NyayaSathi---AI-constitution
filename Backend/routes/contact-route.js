import express from 'express';
import { 
  contactLimiter, 
  contactValidators, 
  handleContact,
  getAllContacts,
  updateContactStatus,
} from '../controllers/contact-controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public route: Submit contact form
router.post('/', contactLimiter, contactValidators, handleContact);

// Admin routes: Manage contacts
router.get('/', protect, admin, getAllContacts);
router.patch('/:id', protect, admin, updateContactStatus);

export default router;
