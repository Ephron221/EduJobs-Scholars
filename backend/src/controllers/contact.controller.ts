import { Request, Response } from 'express';
import Contact from '../models/Contact';
import { createSystemNotification } from '../utils/notify';

export const createMessage = async (req: Request, res: Response) => {
  try {
    const message = await Contact.create(req.body);

    try {
      const { name, subject, email } = req.body;
      await createSystemNotification({
        title: `New Inquiry from ${name || 'Visitor'}`,
        message: subject ? `${subject} (${email || ''})` : `Message received from ${email || 'Contact form'}`,
        type: 'announcement',
        targetRole: 'admin',
        link: '/admin/messages',
      });
    } catch {
      // do not fail inquiry creation
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: 'Error creating message', error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(query);
    const unreadCount = await Contact.countDocuments({ status: 'unread' });

    res.json({
      messages,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

export const updateMessageStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: 'Error updating message', error });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};
