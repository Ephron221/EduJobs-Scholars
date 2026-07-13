import { Request, Response } from 'express';
import fetch from 'node-fetch';

// Simple AI chat controller: uses OpenAI when API key provided, otherwise returns canned responses.
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body as { message?: string };
    if (!message) { res.status(400).json({ message: 'Missing message' }); return; }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    if (OPENAI_KEY) {
      // Forward to OpenAI Chat Completions
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are EduJobs Scholars assistant. Answer concisely and helpfully.' },
            { role: 'user', content: message },
          ],
          max_tokens: 500,
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        res.status(502).json({ message: 'AI provider error', details: t });
        return;
      }

      const data = await resp.json() as any;
      const reply = data?.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
      res.json({ reply });
      return;
    }

    // Fallback canned responses based on keywords
    const text = message.toLowerCase();
    let reply = "Thanks for asking! You can reach EduJobs Scholars via WhatsApp (+250787846344 or +250734733221), call us, or email esront21@gmail.com for support. Which service do you need help with (universities, jobs, programs, guidance)?";

    if (text.includes('scholar') || text.includes('program')) {
      reply = 'For scholarships & programs: browse the Scholarships & Programs section, or tell me the country/field you are interested in and I can suggest options.';
    } else if (text.includes('job') || text.includes('intern')) {
      reply = 'For jobs & internships: search Jobs or tell me desired role, location or field and I will find matching opportunities.';
    } else if (text.includes('apply') || text.includes('deadline')) {
      reply = 'Application deadlines vary by program. Provide the program name or university and I can check typical deadlines and requirements.';
    }

    res.json({ reply });
  } catch (error) {
    console.error('AI chat error', error);
    res.status(500).json({ message: 'Failed to generate reply' });
  }
};
