import express from 'express';
import { ContactController } from './contact.controller';

const router = express.Router();

// Public - anyone can send a direct message through the website contact form
router.post('/', ContactController.sendMessage);

export const ContactRouter = router;