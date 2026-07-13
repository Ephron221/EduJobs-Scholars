import { Request, Response } from 'express';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'verify_token';

async function sendTextMessage(to: string, text: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) throw new Error('WhatsApp credentials not configured');
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    text: { body: text },
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return resp;
}

// Verify webhook (GET) and handle messages (POST)
export const webhook = async (req: Request, res: Response) => {
  // Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge as string);
    }
    return res.status(403).send('Verification failed');
  }

  // Incoming messages
  try {
    const body = req.body;
    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const value = change.value || {};
        const messages = value.messages || [];
        for (const msg of messages) {
          const from = msg.from; // sender phone number
          const text = msg.text?.body || '';

          // Basic automated reply: call OpenAI if configured, otherwise echo
          let reply = 'Thanks for your message. Our team will get back to you soon.';
          const OPENAI_KEY = process.env.OPENAI_API_KEY;
          if (OPENAI_KEY && text) {
            try {
              const r = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${OPENAI_KEY}`,
                },
                body: JSON.stringify({
                  model: 'gpt-3.5-turbo',
                  messages: [
                    { role: 'system', content: 'You are EduJobs Scholars assistant. Be concise and helpful.' },
                    { role: 'user', content: text },
                  ],
                  max_tokens: 400,
                }),
              });
              if (r.ok) {
                const data = await r.json() as any;
                reply = data?.choices?.[0]?.message?.content || reply;
              }
            } catch (e) {
              console.error('OpenAI call failed', e);
            }
          }

          // send reply back via WhatsApp Cloud API
          try {
            await sendTextMessage(from, reply);
          } catch (e) {
            console.error('Failed to send WhatsApp reply', e);
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error', error);
    res.sendStatus(500);
  }
};

export const sendTestMessage = async (req: Request, res: Response) => {
  try {
    const { to, text } = req.body as { to: string; text: string };
    if (!to || !text) return res.status(400).json({ message: 'to and text required' });
    await sendTextMessage(to, text);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send' });
  }
};
