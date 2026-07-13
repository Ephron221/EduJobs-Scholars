import { Router } from 'express';
import { webhook, sendTestMessage } from '../controllers/whatsapp.controller';

const router = Router();

// WhatsApp webhook (GET for verification, POST for messages)
router.get('/webhook', webhook as any);
router.post('/webhook', webhook as any);

// Test send
router.post('/send', sendTestMessage as any);

export default router;
