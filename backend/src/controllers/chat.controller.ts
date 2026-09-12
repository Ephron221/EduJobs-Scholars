import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';
import { createSystemNotification } from '../utils/notify';

// Keywords that indicate payment-related content
const PAYMENT_KEYWORDS = [
  'payment', 'pay', 'paid', 'money', 'cash', 'transfer', 'momo', 'mobile money',
  'bank', 'invoice', 'receipt', 'fee', 'fees', 'charge', 'price', 'cost',
  'transaction', 'deposit', 'withdraw', 'amount', 'frw', 'rwf', 'dollar', 'usd',
  'proof', 'screenshot', 'send money', 'airtel money', 'mtn money'
];

const isPaymentRelated = (content: string): boolean => {
  const lower = content.toLowerCase();
  return PAYMENT_KEYWORDS.some(kw => lower.includes(kw));
};

// Get eligible users to chat with
export const getChatUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = req.user;
    let users;

    // Students can only see admins and assistants
    if (currentUser?.role === 'student') {
      users = await User.find({ role: { $in: ['admin', 'assistant'] } })
        .select('_id name email role avatar lastActive');
    } else {
      // Admins and assistants can see everyone except themselves
      users = await User.find({ _id: { $ne: currentUser?._id } })
        .select('_id name email role avatar lastActive');
    }

    // Determine online status (strictly active within the last 60 seconds)
    const threshold = new Date(Date.now() - 60 * 1000);
    const usersWithOnlineStatus = users.map(user => {
      const isOnline = Boolean(user.lastActive && new Date(user.lastActive) > threshold);
      return {
        ...user.toObject(),
        isOnline
      };
    });

    res.status(200).json(usersWithOnlineStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Get conversation history with a specific user
export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    const messages = await ChatMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .populate('deletionRequestedBy', 'name role');

    // Mark incoming messages as read
    await ChatMessage.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation', error });
  }
};

// Send a new message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { content } = req.body;
    const currentUserId = req.user?._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const newMessage = new ChatMessage({
      sender: currentUserId,
      receiver: userId,
      content: content.trim()
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name avatar role');
    await newMessage.populate('receiver', 'name avatar role');

    // Notify receiver about new direct message
    try {
      const receiverUser = await User.findById(userId).select('role');
      const senderName = req.user?.name || 'Someone';
      const textPreview = content.trim().length > 60 ? content.trim().slice(0, 60) + '...' : content.trim();
      const targetLink = receiverUser?.role === 'student' ? '/dashboard/messages' : '/admin/messages';

      await createSystemNotification({
        title: `New message from ${senderName}`,
        message: textPreview,
        type: 'system',
        userId: String(userId),
        link: targetLink,
      });
    } catch {
      // do not fail message send if notification fails
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};

// Ping to update lastActive
export const pingActive = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating active status', error });
  }
};

// Logout to clear active status immediately
export const logoutActive = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { lastActive: null });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing active status', error });
  }
};

// Request delete or delete a message
// Rules:
//   - Admin: always deletes immediately
//   - Other users (own message only):
//       payment-related → flag pendingDeletion, admin must approve
//       normal          → delete immediately
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const msg = await ChatMessage.findById(id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    // Admin can delete anything immediately
    if (currentUser?.role === 'admin') {
      await ChatMessage.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Message deleted successfully' });
    }

    // Non-admin can only delete their own messages
    if (String(msg.sender) !== String(currentUser?._id)) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Check if payment-related
    if (isPaymentRelated(msg.content)) {
      // Flag for admin approval instead of immediate deletion
      msg.pendingDeletion = true;
      msg.deletionRequestedBy = currentUser?._id as any;
      await msg.save();
      return res.status(200).json({
        message: 'Deletion request submitted. An admin will review and approve.',
        pendingDeletion: true
      });
    }

    // Normal message – delete immediately
    await ChatMessage.findByIdAndDelete(id);
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
};

// Get all messages pending deletion approval (Admin only)
export const getPendingDeletions = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const messages = await ChatMessage.find({ pendingDeletion: true })
      .populate('sender', 'name email avatar role')
      .populate('receiver', 'name email avatar role')
      .populate('deletionRequestedBy', 'name role')
      .sort({ updatedAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending deletions', error });
  }
};

// Approve or reject a pending deletion (Admin only)
export const approveDeletion = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { approve } = req.body; // boolean

    const msg = await ChatMessage.findById(id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    if (approve) {
      await ChatMessage.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Deletion approved and message removed' });
    } else {
      msg.pendingDeletion = false;
      msg.deletionRequestedBy = undefined;
      await msg.save();
      return res.status(200).json({ message: 'Deletion request rejected' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing deletion approval', error });
  }
};

// Get all messages across all users (Admin only)
export const getAdminAllMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { search, page = 1, limit = 50 } = req.query;
    const query: any = {};

    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const total = await ChatMessage.countDocuments(query);
    const messages = await ChatMessage.find(query)
      .populate('sender', 'name email avatar role')
      .populate('receiver', 'name email avatar role')
      .populate('deletionRequestedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.status(200).json({
      messages,
      total,
      page: +page,
      pages: Math.ceil(total / +limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all messages', error });
  }
};
