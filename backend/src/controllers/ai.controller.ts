import { Request, Response } from 'express';

/**
 * AI Chat Controller for EduJobs Scholars
 * This controller is the brain of the "AI Scholar" assistant.
 * It's trained on all activities of the EduJobs system.
 */
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body as { message?: string, history?: any[] };
    if (!message) { 
      res.status(400).json({ message: 'Missing message' }); 
      return; 
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    // The "Knowledge Base" for the AI - Refined and Expanded
    const SYSTEM_CONTEXT = `
      You are "AI Scholar", the highly intelligent and helpful virtual assistant for EduJobs Scholars (edujobscholars.vercel.app).
      
      YOUR ROLE:
      - Act as a senior career and education consultant.
      - Help students and job seekers in Rwanda find their way.
      - Be extremely friendly, professional, and use many relevant emojis.
      
      CORE KNOWLEDGE & SYSTEM ACTIVITIES:
      
      1. UNIVERSITIES & APPLICATIONS:
         - PLATFORM DATA: Information on 150+ universities in Rwanda (UR, AUCA, CMU-Africa, ALU, Kepler, etc.) and global ones.
         - APPLICATIONS OPEN: 
            * Private Universities (ALU, AUCA, Kepler, etc.): Usually rolling admissions, many are OPEN NOW.
            * Public Universities (University of Rwanda - UR): Portals typically open between May and August.
         - HOW TO APPLY: Search for the university in our "Universities" section. Each has a detailed page with requirements and a direct "Learn More" link to their official portal.
         
      2. SCHOLARSHIPS:
         - DATA: Over 500 active scholarships listed.
         - TYPES: Full scholarships (covers everything), Partial funding, and special bursaries.
         - TOP PROGRAMS: Mastercard Foundation, DAAD (Germany), Commonwealth (UK), and Rwanda Govt Scholarships.
         - ACCESS: Browse the "Scholarships & Programs" tab.
         
      3. JOBS & CAREERS:
         - TARGET: Tailored for recent school graduates and junior professionals.
         - OPPORTUNITIES: Entry-level jobs, Internships, and Volunteering.
         - SEARCH: Users can filter by field (IT, Nursing, Finance, Agriculture, etc.) in the "Jobs" section.
         - DASHBOARD: Users can "Save" jobs to track them and see their application history.
         
      4. SUPPORT & CONTACT (VERY IMPORTANT):
         - WHATSAPP COMMUNITY: The fastest way to get help. "EduJobs Scholars" group: https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE
         - HELP DESK: +250 787 846 344 or +250 734 733 221.
         - EMAIL: esront21@gmail.com.
         - PHYSICAL OFFICE: Nyanza, South Province, Rwanda.
         
      5. GUIDANCE & RESOURCES:
         - LOCATION: "Guidance" tab.
         - CONTENT: Professional CV/Resume templates, Interview prep guides, and tutorials on filling application forms.

      RESPONSE GUIDELINES:
      - If asked "is university application open?", explain the difference between private (usually open) and public (May-August).
      - If asked "where do I get support?", emphasize the WhatsApp group.
      - If asked "how do I find jobs?", tell them to use filters in the "Jobs" section.
      - If a question is outside your knowledge, gracefully redirect them to our support lines.
      - Keep responses easy to read, with bullet points for lists.
    `;

    if (OPENAI_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: SYSTEM_CONTEXT },
              ...(history || []).map((h: any) => ({
                role: h.from === 'user' ? 'user' : 'assistant',
                content: h.text
              })),
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (response.ok) {
          const data = await response.json() as any;
          const reply = data?.choices?.[0]?.message?.content;
          if (reply) {
            res.json({ reply });
            return;
          }
        }
      } catch (e) {
        console.error('AI Scholar OpenAI error:', e);
      }
    }

    // --- ENHANCED KEYWORD FALLBACK ---
    const text = message.toLowerCase();
    let reply = "";

    if (text.includes('university') || text.includes('universities') || text.includes('admission') || text.includes('intake')) {
      reply = "EduJobs Scholars features over 150+ universities! 🏛️\n\n- **Private Universities:** Most (like ALU, AUCA) are currently accepting applications.\n- **Public University (UR):** Applications usually open between May and August.\n\nVisit the **Universities** tab on our platform to see detailed requirements and direct links to apply!";
    } 
    else if (text.includes('scholarship') || text.includes('bursary') || text.includes('funding')) {
      reply = "We track 500+ scholarships for you! 🎓\n\nYou can find Full and Partial scholarships in our **Scholarships & Programs** section. Whether you want to study in Rwanda or abroad (USA, UK, Canada, China), we have options for you. \n\n**Tip:** Join our WhatsApp group for instant alerts when new scholarships are posted: https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE";
    }
    else if (text.includes('job') || text.includes('work') || text.includes('internship') || text.includes('vacancy')) {
      reply = "Looking for work? 💼 We focus on entry-level jobs and internships for graduates. \n\nGo to the **Jobs** section to filter by your field of study. You can also save jobs to your profile and track your applications easily from your dashboard!";
    }
    else if (text.includes('apply') || text.includes('how to')) {
      reply = "Applying is simple! 🚀\n\n1. Find an opportunity in the **Jobs** or **Universities** section.\n2. Click on it to read the requirements.\n3. Follow the instructions or click the 'Apply' button.\n\nNeed help with your CV? Check out our **Guidance** section for free templates!";
    }
    else if (text.includes('support') || text.includes('help') || text.includes('contact') || text.includes('admin')) {
      reply = "We're here to support you! 🤝\n\n- **WhatsApp Community:** https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE\n- **Phone:** +250 787 846 344\n- **Email:** esront21@gmail.com\n\nYou can also find us in Nyanza, South Province.";
    }
    else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      reply = "Hello! 👋 I'm AI Scholar. I'm trained to help you navigate universities, scholarships, and jobs on the EduJobs Scholars platform. What can I help you find today?";
    }
    else {
      reply = "I'm here to help you succeed! 🎓 For information on universities, jobs, or scholarships, please check the relevant sections on our website. \n\nIf you have a very specific question, our WhatsApp community is the best place to talk to our human experts: https://chat.whatsapp.com/BDEAa9Knxs7J3SCarkhvvE";
    }

    res.json({ reply });
  } catch (error) {
    console.error('Chat controller crashed', error);
    res.status(500).json({ message: 'AI Assistant temporarily unavailable' });
  }
};
