import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mail,
  MessageSquare,
  Phone,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  Smartphone,
  Send,
  User as UserIcon,
  Shield,
  AlertCircle,
  Check,
  X,
  ListFilter,
  Eye,
  RefreshCw,
  Users
} from 'lucide-react';
import { contactAPI, chatAPI } from '../../api';
import AdminLayout from './AdminLayout';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
}

interface ChatMessage {
  _id: string;
  sender: { _id: string; name: string; email?: string; avatar?: string; role?: string };
  receiver: { _id: string; name: string; email?: string; avatar?: string; role?: string };
  content: string;
  isRead: boolean;
  pendingDeletion: boolean;
  deletionRequestedBy?: { _id: string; name: string; role?: string };
  createdAt: string;
}

export default function AdminMessages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'all-messages' | 'pending-approvals' | 'inquiries'>('chat');

  // --- DIRECT CHAT STATE ---
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'assistant' | 'admin'>('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- ALL MESSAGES AUDIT STATE (ADMIN ONLY) ---
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [allMsgTotal, setAllMsgTotal] = useState(0);
  const [allMsgLoading, setAllMsgLoading] = useState(false);
  const [allMsgSearch, setAllMsgSearch] = useState('');
  const [allMsgPage, setAllMsgPage] = useState(1);

  // --- PENDING DELETIONS STATE ---
  const [pendingDeletions, setPendingDeletions] = useState<ChatMessage[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // --- CONTACT INQUIRIES STATE ---
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [inqLoading, setInqLoading] = useState(false);
  const [inqSearch, setInqSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [inqPage, setInqPage] = useState(1);
  const [inqTotal, setInqTotal] = useState(0);
  const [inqUnreadCount, setInqUnreadCount] = useState(0);
  const [viewInquiryModal, setViewInquiryModal] = useState<ContactMessage | null>(null);
  const [deleteInquiryId, setDeleteInquiryId] = useState<string | null>(null);

  // Fetch Users
  const fetchChatUsers = async () => {
    try {
      const res = await chatAPI.getUsers();
      const list = Array.isArray(res.data) ? res.data : (res.data?.users || []);
      setChatUsers(list);
    } catch {
      // silent
    }
  };

  // Fetch Conversation
  const fetchConversation = async (userId: string, silent = false) => {
    try {
      if (!silent) setChatLoading(true);
      const res = await chatAPI.getConversation(userId);
      const list = Array.isArray(res.data) ? res.data : (res.data?.messages || []);
      setChatMessages(list);
    } catch {
      // silent
    } finally {
      if (!silent) setChatLoading(false);
    }
  };

  // Fetch Pending Deletions
  const fetchPendingDeletions = async () => {
    setPendingLoading(true);
    try {
      const res = await chatAPI.getPendingDeletions();
      const list = Array.isArray(res.data) ? res.data : (res.data?.messages || []);
      setPendingDeletions(list);
    } catch {
      // silent
    } finally {
      setPendingLoading(false);
    }
  };

  // Fetch All Platform Messages (Admin Audit)
  const fetchAllMessages = async () => {
    setAllMsgLoading(true);
    try {
      const res = await chatAPI.getAllMessages({
        search: allMsgSearch || undefined,
        page: allMsgPage,
        limit: 20
      });
      const list = Array.isArray(res.data?.messages) ? res.data.messages : (Array.isArray(res.data) ? res.data : []);
      setAllMessages(list);
      setAllMsgTotal(res.data?.total || 0);
    } catch {
      // silent
    } finally {
      setAllMsgLoading(false);
    }
  };

  // Fetch Contact Inquiries
  const fetchInquiries = useCallback(async () => {
    setInqLoading(true);
    try {
      const res = await contactAPI.getAll({ search: inqSearch, status: filterStatus || undefined, page: inqPage, limit: 15 });
      const list = Array.isArray(res.data?.messages) ? res.data.messages : (Array.isArray(res.data) ? res.data : []);
      setInquiries(list);
      setInqTotal(res.data?.total || 0);
      setInqUnreadCount(res.data?.unreadCount || 0);
    } catch {
      toast.error('Failed to load inquiries');
    }
    setInqLoading(false);
  }, [inqSearch, filterStatus, inqPage]);

  // Initial mount: load users, pending deletions count, heartbeat
  useEffect(() => {
    fetchChatUsers();
    fetchPendingDeletions();
    chatAPI.ping();

    const interval = setInterval(() => {
      chatAPI.ping();
      fetchChatUsers();
      fetchPendingDeletions();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Poll conversation when selected
  useEffect(() => {
    if (!selectedUser) return;
    fetchConversation(selectedUser._id);

    const convInterval = setInterval(() => {
      fetchConversation(selectedUser._id, true);
    }, 6000);

    return () => clearInterval(convInterval);
  }, [selectedUser]);

  // Tab effects
  useEffect(() => {
    if (activeTab === 'inquiries') {
      fetchInquiries();
    } else if (activeTab === 'all-messages') {
      fetchAllMessages();
    } else if (activeTab === 'pending-approvals') {
      fetchPendingDeletions();
    }
  }, [activeTab, inqPage, allMsgPage, allMsgSearch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newChatMessage.trim()) return;
    try {
      const res = await chatAPI.sendMessage(selectedUser._id, newChatMessage.trim());
      setChatMessages(prev => [...prev, res.data]);
      setNewChatMessage('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  // Admin deletes any message
  const handleDeleteChatMessage = async (id: string) => {
    if (!window.confirm('Delete this message permanently? (Admin override)')) return;
    try {
      await chatAPI.deleteMessage(id);
      setChatMessages(prev => prev.filter(m => m._id !== id));
      setAllMessages(prev => prev.filter(m => m._id !== id));
      setPendingDeletions(prev => prev.filter(m => m._id !== id));
      toast.success('Message permanently deleted');
    } catch {
      toast.error('Failed to delete message');
    }
  };

  // Approve / Reject deletion of payment message
  const handleApproveDeletion = async (id: string, approve: boolean) => {
    try {
      await chatAPI.approveDeletion(id, approve);
      setPendingDeletions(prev => prev.filter(m => m._id !== id));
      if (approve) {
        setChatMessages(prev => prev.filter(m => m._id !== id));
        setAllMessages(prev => prev.filter(m => m._id !== id));
        toast.success('Deletion approved and message permanently removed');
      } else {
        toast.success('Deletion request rejected. Message kept intact.');
      }
    } catch {
      toast.error('Failed to process deletion approval');
    }
  };

  // Inquiries actions
  const toggleInquiryStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
      await contactAPI.updateStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      if (viewInquiryModal && viewInquiryModal._id === id) {
        setViewInquiryModal({ ...viewInquiryModal, status: newStatus as 'unread' | 'read' });
      }
      fetchInquiries();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await contactAPI.delete(id);
      toast.success('Inquiry deleted');
      setDeleteInquiryId(null);
      fetchInquiries();
    } catch {
      toast.error('Failed to delete inquiry');
    }
  };

  const openInquiry = (msg: ContactMessage) => {
    setViewInquiryModal(msg);
    if (msg.status === 'unread') toggleInquiryStatus(msg._id, 'unread');
  };

  const getWaLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, '')}`;

  const filteredChatUsers = chatUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesOnline = !onlineOnly || u.isOnline;
    return matchesSearch && matchesRole && matchesOnline;
  });

  const onlineCount = chatUsers.filter(u => u.isOnline).length;

  return (
    <AdminLayout title="Messages & Inquiries">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <MessageSquare size={15} />
          <span>Direct Chat</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-green-500 text-white font-extrabold">
            {onlineCount} Online
          </span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('all-messages')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all-messages'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Eye size={15} />
            <span>All Messages Monitor (Admin)</span>
          </button>
        )}

        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('pending-approvals')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pending-approvals'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <AlertCircle size={15} />
            <span>Payment Deletion Approvals</span>
            {pendingDeletions.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {pendingDeletions.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'inquiries'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Mail size={15} />
          <span>Contact Inquiries</span>
          {inqUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {inqUnreadCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DIRECT CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-210px)] flex overflow-hidden">
          {/* User Selection List */}
          <div className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/30">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Direct Contacts</h2>
                <span className="text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full">
                  ● {onlineCount} Online
                </span>
              </div>

              {/* Search */}
              <div className="relative mt-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search student or staff..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-white"
                />
              </div>

              {/* Role filter chips & Online filter */}
              <div className="flex flex-wrap items-center gap-1 mt-2.5">
                {(['all', 'student', 'assistant', 'admin'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md transition-all ${
                      roleFilter === role
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
                <button
                  onClick={() => setOnlineOnly(prev => !prev)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                    onlineOnly
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100'
                  }`}
                  title="Filter to show only currently active users"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${onlineOnly ? 'bg-white' : 'bg-green-500'}`} />
                  Online Only
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredChatUsers.length === 0 ? (
                <div className="text-center p-6 text-gray-400 text-xs">
                  {onlineOnly ? 'No users are currently online.' : 'No users found.'}
                </div>
              ) : (
                filteredChatUsers.map(u => {
                  const isSelected = selectedUser?._id === u._id;
                  return (
                    <button
                      key={u._id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-all border-b border-gray-100 dark:border-gray-800 ${
                        isSelected
                          ? 'bg-cyan-50/90 dark:bg-cyan-950/40 border-l-4 border-l-cyan-500 shadow-xs'
                          : 'hover:bg-white dark:hover:bg-gray-800/60 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full ${
                            u.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                            {u.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : u.role === 'assistant'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className={`text-[11px] ${u.isOnline ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400'}`}>
                            {u.isOnline ? 'Online now' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Conversation Panel */}
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-w-0">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="px-6 py-3.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-bold text-sm">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-gray-800 rounded-full ${
                          selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">{selectedUser.name}</h3>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {selectedUser.isOnline ? <span className="text-green-600 dark:text-green-400 font-medium">Online</span> : 'Offline'} · {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2.5 py-1 rounded-lg">
                      <Shield size={12} className="text-cyan-500" />
                      Admin Control: Hover any message to delete
                    </div>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3.5 custom-scrollbar">
                  {chatLoading ? (
                    <div className="p-8 text-center"><Loader /></div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Clock size={36} className="mb-2 opacity-20" />
                      <p className="font-semibold text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Send a message below to start this conversation.</p>
                    </div>
                  ) : (
                    chatMessages.map(msg => {
                      const isMine = msg.sender._id === user?._id;
                      return (
                        <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group relative`}>
                          <div className="relative max-w-[72%]">
                            <div
                              className={`p-3.5 px-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                                msg.pendingDeletion
                                  ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                                  : isMine
                                  ? 'bg-cyan-600 text-white rounded-br-xs'
                                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-xs'
                              }`}
                            >
                              {msg.pendingDeletion && (
                                <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1.5 pb-1 border-b border-amber-200 dark:border-amber-800">
                                  <span className="flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Deletion Pending Admin Approval
                                  </span>
                                  {user?.role === 'admin' && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleApproveDeletion(msg._id, true)}
                                        className="px-2 py-0.5 bg-green-600 text-white rounded text-[10px] hover:bg-green-700"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleApproveDeletion(msg._id, false)}
                                        className="px-2 py-0.5 bg-gray-500 text-white rounded text-[10px] hover:bg-gray-600"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <span className={`text-[10px] mt-1.5 block ${isMine && !msg.pendingDeletion ? 'text-cyan-100' : 'text-gray-400'}`}>
                                {format(new Date(msg.createdAt), 'MMM dd, h:mm a')}
                              </span>
                            </div>

                            {/* Delete button (Admin can delete any message, user can delete own) */}
                            {(user?.role === 'admin' || isMine) && (
                              <button
                                onClick={() => handleDeleteChatMessage(msg._id)}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                                title="Delete message"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input form */}
                <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={e => setNewChatMessage(e.target.value)}
                      placeholder={`Reply to ${selectedUser.name}...`}
                      className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-transparent rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newChatMessage.trim()}
                      className="h-10 px-5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-xs flex items-center gap-2 shrink-0 shadow-xs"
                    >
                      <span>Send</span>
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-4">
                  <UserIcon size={36} className="text-gray-400" />
                </div>
                <p className="font-bold text-base text-gray-700 dark:text-gray-200">Select a user to chat</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm text-center">
                  Select any student, application assistant, or administrator from the list to start a real-time conversation.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL MESSAGES MONITOR (ADMIN ONLY) */}
      {activeTab === 'all-messages' && user?.role === 'admin' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Shield size={16} className="text-cyan-500" />
                All Platform Messages (Global Admin Monitor)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Admins have full visibility over all conversations and can delete any inappropriate or fraudulent messages directly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={allMsgSearch}
                  onChange={e => {
                    setAllMsgSearch(e.target.value);
                    setAllMsgPage(1);
                  }}
                  placeholder="Search message text..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={fetchAllMessages}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                Refresh
              </button>
            </div>
          </div>

          {allMsgLoading ? (
            <div className="p-12 text-center"><Loader /></div>
          ) : allMessages.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-gray-400 text-sm border border-gray-200 dark:border-gray-700">
              No messages found on the platform matching your criteria.
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
                    <tr>
                      <th className="table-header">Sender</th>
                      <th className="table-header">Receiver</th>
                      <th className="table-header">Message Content</th>
                      <th className="table-header">Date & Status</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {allMessages.map(msg => (
                      <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                        <td className="table-cell">
                          <div className="font-semibold text-xs text-gray-900 dark:text-white">
                            {msg.sender?.name || 'Unknown'}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-gray-500">
                            {msg.sender?.role || 'user'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="font-semibold text-xs text-gray-900 dark:text-white">
                            {msg.receiver?.name || 'Unknown'}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-gray-500">
                            {msg.receiver?.role || 'user'}
                          </span>
                        </td>
                        <td className="table-cell max-w-md">
                          <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2">
                            {msg.content}
                          </p>
                          {msg.pendingDeletion && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              Deletion Requested by {msg.deletionRequestedBy?.name || 'User'}
                            </span>
                          )}
                        </td>
                        <td className="table-cell whitespace-nowrap text-xs text-gray-500">
                          {format(new Date(msg.createdAt), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="table-cell text-right">
                          <button
                            onClick={() => handleDeleteChatMessage(msg._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete message as Admin"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {allMsgTotal > 20 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500">
                    Showing Page {allMsgPage} (Total: {allMsgTotal} messages)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAllMsgPage(p => Math.max(1, p - 1))}
                      disabled={allMsgPage === 1}
                      className="btn-secondary py-1 px-3 text-xs disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setAllMsgPage(p => p + 1)}
                      disabled={allMsgPage * 20 >= allMsgTotal}
                      className="btn-secondary py-1 px-3 text-xs disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYMENT DELETION APPROVALS */}
      {activeTab === 'pending-approvals' && user?.role === 'admin' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl">
            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600" />
              Payment Message Deletion Approval Queue
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              As per security requirements, when students or users request to delete messages mentioning payment proofs, receipts, or money transfers, the messages are retained until an Admin explicitly confirms the deletion.
            </p>
          </div>

          {pendingLoading ? (
            <div className="p-12 text-center"><Loader /></div>
          ) : pendingDeletions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center text-gray-400 text-sm border border-gray-200 dark:border-gray-700">
              <CheckCircle size={36} className="mx-auto mb-2 text-green-500 opacity-60" />
              No deletion requests currently awaiting approval!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDeletions.map(msg => (
                <div
                  key={msg._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-amber-300/80 dark:border-amber-700/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                      <div>
                        <span className="text-[11px] text-gray-500">Sender: </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {msg.sender?.name} ({msg.sender?.role})
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-500">Receiver: </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {msg.receiver?.name} ({msg.receiver?.role})
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-mono">
                        {msg.content}
                      </p>
                    </div>

                    <div className="mt-2.5 text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Sent on: {format(new Date(msg.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        Requested by: {msg.deletionRequestedBy?.name || 'User'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleApproveDeletion(msg._id, true)}
                      className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Check size={14} />
                      Confirm & Delete
                    </button>
                    <button
                      onClick={() => handleApproveDeletion(msg._id, false)}
                      className="flex-1 py-2 px-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X size={14} />
                      Reject & Keep Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONTACT INQUIRIES (FROM PUBLIC CONTACT PAGE) */}
      {activeTab === 'inquiries' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{inqTotal}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <MessageSquare className="text-cyan-500" size={20} />
              </div>
            </div>
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-yellow-500">{inqUnreadCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="text-yellow-500" size={20} />
              </div>
            </div>
            <div className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Read / Resolved</p>
                <p className="text-2xl font-bold text-green-500">{inqTotal - inqUnreadCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="text-green-500" size={20} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={inqSearch}
                onChange={e => {
                  setInqSearch(e.target.value);
                  setInqPage(1);
                }}
                placeholder="Search name, email, subject..."
                className="input-field pl-9 py-2.5"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setInqPage(1);
              }}
              className="select-field w-36 py-2.5"
            >
              <option value="">All Statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Inquiries Table */}
          {inqLoading ? (
            <Loader />
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/2">
                    <tr>
                      <th className="table-header">Sender / Subject</th>
                      <th className="table-header">Contact Info</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-gray-500 dark:text-gray-400">
                          No inquiries found
                        </td>
                      </tr>
                    ) : (
                      inquiries.map(m => (
                        <tr
                          key={m._id}
                          onClick={() => openInquiry(m)}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-l-4 ${
                            m.status === 'unread'
                              ? 'border-l-cyan-500 bg-cyan-50/30 dark:bg-cyan-900/10'
                              : 'border-l-transparent'
                          }`}
                        >
                          <td className="table-cell">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  m.status === 'unread'
                                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-black'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                                }`}
                              >
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p
                                  className={`text-sm ${
                                    m.status === 'unread'
                                      ? 'font-bold text-gray-900 dark:text-white'
                                      : 'font-medium text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {m.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] md:max-w-xs truncate">
                                  {m.subject}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="text-xs text-gray-600 dark:text-gray-400 block">{m.email}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-500 font-mono">{m.phone}</span>
                          </td>
                          <td className="table-cell">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(m.createdAt), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                m.status === 'unread'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {Math.ceil(inqTotal / 15) > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => setInqPage(p => p - 1)}
                    disabled={inqPage === 1}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {inqPage} of {Math.ceil(inqTotal / 15)}
                  </span>
                  <button
                    onClick={() => setInqPage(p => p + 1)}
                    disabled={inqPage === Math.ceil(inqTotal / 15)}
                    className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal View Inquiry */}
          {viewInquiryModal && (
            <Modal isOpen={!!viewInquiryModal} onClose={() => setViewInquiryModal(null)} title="Inquiry Details" size="md">
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{viewInquiryModal.subject}</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">From</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{viewInquiryModal.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Date</span>
                      <span className="text-gray-900 dark:text-white">
                        {format(new Date(viewInquiryModal.createdAt), 'MMM dd, yyyy - hh:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={`mailto:${viewInquiryModal.email}`}
                    className="btn-secondary flex flex-col items-center justify-center gap-1 py-3 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border-cyan-100 dark:border-cyan-900/50"
                  >
                    <Mail size={18} />
                    <span className="text-xs font-semibold">Email Reply</span>
                  </a>
                  <a
                    href={getWaLink(viewInquiryModal.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex flex-col items-center justify-center gap-1 py-3 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-100 dark:border-green-900/50"
                  >
                    <Smartphone size={18} />
                    <span className="text-xs font-semibold">WhatsApp</span>
                  </a>
                  <a
                    href={`sms:${viewInquiryModal.phone}`}
                    className="btn-secondary flex flex-col items-center justify-center gap-1 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-100 dark:border-blue-900/50"
                  >
                    <Phone size={18} />
                    <span className="text-xs font-semibold">Send SMS</span>
                  </a>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Message</p>
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 min-h-[120px]">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {viewInquiryModal.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10 items-center justify-between">
                  <button
                    onClick={() => setDeleteInquiryId(viewInquiryModal._id)}
                    className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleInquiryStatus(viewInquiryModal._id, viewInquiryModal.status)}
                      className="btn-secondary py-2 text-xs"
                    >
                      Mark as {viewInquiryModal.status === 'unread' ? 'Read' : 'Unread'}
                    </button>
                    <button onClick={() => setViewInquiryModal(null)} className="btn-primary py-2 px-6">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          )}

          {/* Delete inquiry confirmation */}
          <Modal isOpen={!!deleteInquiryId} onClose={() => setDeleteInquiryId(null)} title="Delete Inquiry" size="sm">
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">
              Are you sure you want to delete this inquiry permanently?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteInquiryId(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={() => handleDeleteInquiry(deleteInquiryId!)} className="btn-danger flex-1 font-semibold">
                Delete
              </button>
            </div>
          </Modal>
        </>
      )}
    </AdminLayout>
  );
}
