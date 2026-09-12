import { useState, useEffect, useRef } from 'react';
import {
  Send,
  User as UserIcon,
  Clock,
  Trash2,
  AlertCircle,
  Search,
  FileText,
  Shield,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { chatAPI, applicationAPI } from '../../api';
import StudentLayout from './StudentLayout';
import Loader from '../../components/Loader';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

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
  sender: { _id: string; name: string; avatar?: string; role?: string };
  receiver: { _id: string; name: string; avatar?: string; role?: string };
  content: string;
  isRead: boolean;
  pendingDeletion: boolean;
  createdAt: string;
}

interface ApplicationItem {
  _id: string;
  opportunityName: string;
  opportunityType: string;
  status: string;
  appliedAt: string;
  notes?: string;
}

const PAYMENT_KEYWORDS = [
  'payment', 'pay', 'paid', 'money', 'cash', 'transfer', 'momo', 'mobile money',
  'bank', 'invoice', 'receipt', 'fee', 'fees', 'charge', 'price', 'cost',
  'transaction', 'deposit', 'withdraw', 'amount', 'frw', 'rwf', 'dollar', 'usd',
  'proof', 'screenshot', 'airtel money', 'mtn money'
];

const isPaymentRelated = (content: string) =>
  PAYMENT_KEYWORDS.some(kw => content.toLowerCase().includes(kw));

export default function StudentMessages() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'assistant'>('all');
  const [onlineOnly, setOnlineOnly] = useState(false);

  // Application progress tracking
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [showAppsPanel, setShowAppsPanel] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await chatAPI.getUsers();
      const userList = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.users) ? res.data.users : []);
      setUsers(userList);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!user?._id) return;
    setLoadingApps(true);
    try {
      const res = await applicationAPI.getByStudent(user._id);
      const appList = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.applications) ? res.data.applications : []);
      setApplications(appList);
    } catch {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchConversation = async (userId: string, silent = false) => {
    try {
      if (!silent) setChatLoading(true);
      const res = await chatAPI.getConversation(userId);
      const msgList = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data?.messages) ? res.data.messages : []);
      setMessages(msgList);
    } catch {
      // silent
    } finally {
      if (!silent) setChatLoading(false);
    }
  };

  // Mount: fetch users, fetch applications, start heartbeat ping
  useEffect(() => {
    fetchUsers();
    fetchApplications();
    chatAPI.ping();

    intervalRef.current = setInterval(() => {
      chatAPI.ping();
      fetchUsers();
    }, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user?._id]);

  // Poll conversation when user is selected
  useEffect(() => {
    if (!selectedUser) return;
    fetchConversation(selectedUser._id);

    const convInterval = setInterval(() => {
      fetchConversation(selectedUser._id, true);
    }, 6000);

    return () => clearInterval(convInterval);
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText !== undefined ? customText : newMessage;
    if (!selectedUser || !textToSend.trim()) return;

    try {
      const res = await chatAPI.sendMessage(selectedUser._id, textToSend.trim());
      setMessages(prev => [...prev, res.data]);
      if (customText === undefined) {
        setNewMessage('');
      }
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleInquireApplication = (app: ApplicationItem) => {
    const inquiryText = `Hello! I would like to inquire about the progress of my application for "${app.opportunityName}" (${app.opportunityType}). Current status is listed as "${app.status}". Could you please provide an update?`;
    if (!selectedUser) {
      // Pick first available staff
      if (users.length > 0) {
        setSelectedUser(users[0]);
        setNewMessage(inquiryText);
        toast.success(`Selected ${users[0].name}. You can send your inquiry now!`);
      } else {
        toast.error('No staff member available currently.');
      }
    } else {
      setNewMessage(inquiryText);
      toast.success('Inquiry draft added to message box! Click send when ready.');
    }
  };

  const handleDeleteMessage = async (msg: ChatMessage) => {
    const isPayment = isPaymentRelated(msg.content);
    const confirmText = isPayment
      ? 'This message contains payment discussion or proof. Per system security rules, deletion must be confirmed and approved by an Admin. Submit deletion request for Admin review?'
      : 'Delete this message permanently?';

    if (!window.confirm(confirmText)) return;

    try {
      const res = await chatAPI.deleteMessage(msg._id);
      if (res.data.pendingDeletion) {
        setMessages(prev =>
          prev.map(m => m._id === msg._id ? { ...m, pendingDeletion: true } : m)
        );
        toast.success('Payment message deletion requested. Awaiting Admin confirmation.', {
          icon: '⏳',
          duration: 5000,
        });
      } else {
        setMessages(prev => prev.filter(m => m._id !== msg._id));
        toast.success('Message deleted successfully');
      }
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesOnline = !onlineOnly || u.isOnline;
    return matchesSearch && matchesRole && matchesOnline;
  });

  const onlineCount = users.filter(u => u.isOnline).length;

  return (
    <StudentLayout title="Messages">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        
        {/* Left Sidebar – Staff Directory & Filter */}
        <div className="w-80 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/30">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                Staff & Assistants
              </h2>
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {onlineCount} Online
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Directly chat with Admins or Application Assistants of your choice
            </p>

            {/* Search Box */}
            <div className="mt-3 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search staff..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Role Filter Chips */}
            <div className="flex items-center gap-1 mt-2.5 flex-wrap">
              <button
                onClick={() => setRoleFilter('all')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                  roleFilter === 'all'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  roleFilter === 'admin'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                <Shield size={11} /> Admin
              </button>
              <button
                onClick={() => setRoleFilter('assistant')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  roleFilter === 'assistant'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                <HelpCircle size={11} /> Assistants
              </button>
              <button
                onClick={() => setOnlineOnly(prev => !prev)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  onlineOnly
                    ? 'bg-green-600 text-white shadow-xs'
                    : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${onlineOnly ? 'bg-white' : 'bg-green-500'}`} />
                Online Only
              </button>
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center"><Loader /></div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-6 text-gray-400 text-xs">
                {onlineOnly ? 'No staff are currently online.' : 'No users found.'}
              </div>
            ) : (
              filteredUsers.map(u => {
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
                        title={u.isOnline ? 'Online now' : 'Offline'}
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
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}
                        >
                          {u.role === 'assistant' ? 'Assistant' : 'Admin'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-[11px] ${u.isOnline ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400'}`}>
                          {u.isOnline ? 'Active now' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Application Inquiry shortcut in sidebar */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40">
            <button
              onClick={() => setShowAppsPanel(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-700 dark:text-cyan-300 rounded-xl text-xs font-semibold border border-cyan-500/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <FileText size={15} className="text-cyan-600 dark:text-cyan-400" />
                <span>My Applications ({Array.isArray(applications) ? applications.length : 0})</span>
              </span>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400">
                {showAppsPanel ? 'Hide' : 'Inquire →'}
              </span>
            </button>
          </div>
        </div>

        {/* Center: Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-w-0">
          {selectedUser ? (
            <>
              {/* Chat Header */}
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
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        {selectedUser.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 capitalize">
                        {selectedUser.role === 'assistant' ? 'Application Assistant' : 'System Admin'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {selectedUser.isOnline ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">Online & Ready to help</span>
                      ) : (
                        'Offline · Messages will be delivered immediately'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAppsPanel(prev => !prev)}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <FileText size={14} />
                    <span>Application Progress</span>
                  </button>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 custom-scrollbar">
                {chatLoading ? (
                  <div className="p-8 text-center"><Loader /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-3">
                      <Sparkles size={28} />
                    </div>
                    <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">
                      Start your conversation with {selectedUser.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm text-center">
                      Ask questions regarding universities, jobs, application progress, or submit payment details safely.
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender._id === user?._id;
                    const paymentDetected = isPaymentRelated(msg.content);

                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
                        <div className="relative max-w-[72%]">
                          <div
                            className={`p-3.5 px-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                              msg.pendingDeletion
                                ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 opacity-80'
                                : isMine
                                ? 'bg-cyan-600 text-white rounded-br-xs'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-xs'
                            }`}
                          >
                            {/* Pending Admin Approval Banner */}
                            {msg.pendingDeletion && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1.5 pb-1 border-b border-amber-200 dark:border-amber-800">
                                <AlertCircle size={13} />
                                <span>Deletion pending Admin approval (Payment content)</span>
                              </div>
                            )}

                            {/* Payment indicator badge */}
                            {paymentDetected && !msg.pendingDeletion && (
                              <div className="flex items-center gap-1 text-[10px] font-semibold opacity-90 mb-1">
                                <span className={`px-1.5 py-0.5 rounded ${isMine ? 'bg-cyan-700 text-cyan-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                  💰 Payment Details / Proof
                                </span>
                              </div>
                            )}

                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                            <div className={`flex items-center justify-between gap-3 text-[10px] mt-1.5 ${isMine && !msg.pendingDeletion ? 'text-cyan-100' : 'text-gray-400'}`}>
                              <span>{format(new Date(msg.createdAt), 'MMM dd, h:mm a')}</span>
                              {isMine && !msg.pendingDeletion && (
                                <span className="text-[10px]">{msg.isRead ? '✓✓ Read' : '✓ Sent'}</span>
                              )}
                            </div>
                          </div>

                          {/* Delete button (only on own messages, when not already pending) */}
                          {isMine && !msg.pendingDeletion && (
                            <button
                              onClick={() => handleDeleteMessage(msg)}
                              className="absolute -left-9 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                              title={paymentDetected ? 'Request deletion (Admin approval required)' : 'Delete message'}
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

              {/* Message Input Box */}
              <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={`Message ${selectedUser.name}...`}
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-900 border border-transparent rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
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
              <p className="font-bold text-base text-gray-700 dark:text-gray-200">Select a staff member</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm text-center">
                Choose an Admin or Application Assistant from the list to start a conversation, get guidance, or check your application progress.
              </p>
            </div>
          )}
        </div>

        {/* Right Drawer: Application Progress Inquiries */}
        {showAppsPanel && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 p-4 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-cyan-500" />
                Application Progress
              </h3>
              <button
                onClick={() => setShowAppsPanel(false)}
                className="text-gray-400 hover:text-gray-600 text-xs px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 mb-3">
              Click &quot;Inquire Status&quot; to automatically draft a progress inquiry message to your selected assistant:
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {loadingApps ? (
                <div className="p-4 text-center"><Loader /></div>
              ) : (!Array.isArray(applications) || applications.length === 0) ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No applications tracked yet.
                </div>
              ) : (
                applications.map(app => (
                  <div
                    key={app._id}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-2">
                        {app.opportunityName}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 shrink-0">
                        {app.opportunityType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-gray-500 text-[11px]">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'Accepted' || app.status === 'Resolved'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : app.status === 'Rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleInquireApplication(app)}
                      className="mt-3 w-full py-1.5 px-3 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Send size={12} />
                      <span>Inquire Status</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
