import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, ChevronLeft, Users, Smile, Heart, Pencil, Trash2, Check, XCircle, Crown, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤔','👍','👏','❤️','🔥','🎉','😢','😮','🙏','💪','✨','😊','🤗','😘','👌'];

interface ChatUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  live: string;
  unreadCount: number;
  lastMessage: ChatMessage | null;
  profilePhoto?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderNom: string;
  senderRole?: string;
  receiverId: string;
  receiverNom: string;
  receiverRole?: string;
  contenu: string;
  date: string;
  lu: boolean;
  edited?: boolean;
  deleted?: boolean;
}

const LiveChatAdmin: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const selectedUserIdRef = useRef<string | null>(null);

  useEffect(() => { selectedUserIdRef.current = selectedUserId; }, [selectedUserId]);

  const getToken = () => localStorage.getItem('token');

  const loadUsers = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/livechat/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data: ChatUser[] = await res.json();
        setChatUsers(data);
        setTotalUnread(data.reduce((sum, u) => sum + u.unreadCount, 0));
      }
    } catch (e) {
      console.error('Error loading users:', e);
    }
  }, [user]);

  const loadMessages = useCallback(async (otherUserId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/livechat/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        loadUsers(); // refresh unread counts
      }
    } catch (e) {
      console.error('Error loading messages:', e);
    }
  }, [user, loadUsers]);

  // SSE + polling
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    loadUsers();

    const es = new EventSource(`${API_BASE}/api/livechat/events?userId=${user.id}`);
    eventSourceRef.current = es;

    es.addEventListener('new_livechat_message', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        const currentSelected = selectedUserIdRef.current;
        const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
        
        if (currentSelected === otherUserId) {
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
          // Auto mark as read
          if (msg.senderId !== user.id) {
            fetch(`${API_BASE}/api/livechat/messages/${otherUserId}`, {
              headers: { Authorization: `Bearer ${getToken()}` }
            }).catch(() => {});
          }
        }
        loadUsers();
      } catch {}
    });

    es.addEventListener('livechat_message_edited', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      } catch {}
    });

    es.addEventListener('livechat_message_deleted', (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data);
        setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
      } catch {}
    });

    es.addEventListener('livechat_typing', (e) => {
      try {
        const data = JSON.parse(e.data);
        setTypingUsers(prev => ({ ...prev, [data.senderId]: data.isTyping }));
      } catch {}
    });

    es.addEventListener('user_status', (e) => {
      try {
        const { userId: uid, live } = JSON.parse(e.data);
        setChatUsers(prev => prev.map(u => u.id === uid ? { ...u, live } : u));
      } catch {}
    });

    es.addEventListener('unread_update', () => { loadUsers(); });
    es.addEventListener('messages_read', () => { loadUsers(); });
    es.onerror = () => {};

    const pollInterval = setInterval(() => {
      const cur = selectedUserIdRef.current;
      if (cur) {
        fetch(`${API_BASE}/api/livechat/messages/${cur}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        }).then(r => r.ok ? r.json() : []).then(d => setMessages(d)).catch(() => {});
      }
      loadUsers();
    }, 3000);

    return () => { es.close(); eventSourceRef.current = null; clearInterval(pollInterval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const openConversation = (otherUserId: string) => {
    setSelectedUserId(otherUserId);
    loadMessages(otherUserId);
  };

  const handleSend = async () => {
    if (!input.trim() || isSending || !selectedUserId || !user) return;
    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/livechat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ receiverId: selectedUserId, contenu: input.trim() })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
        setInput('');
        setShowEmojis(false);
        sendTypingIndicator(false);
        loadUsers();
      }
    } catch (e) { console.error('Error sending:', e); }
    finally { setIsSending(false); }
  };

  const handleEdit = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/livechat/edit/${msgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ contenu: editText.trim() })
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    } catch {}
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (msgId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/livechat/delete/${msgId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      }
    } catch {}
    setContextMenuId(null);
  };

  const sendTypingIndicator = (isTyping: boolean) => {
    if (!selectedUserId || !user) return;
    fetch(`${API_BASE}/api/livechat/typing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ receiverId: selectedUserId, isTyping })
    }).catch(() => {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTypingIndicator(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingIndicator(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getRoleIcon = (role?: string) => {
    if (role === 'administrateur principale') return <Crown className="h-3 w-3 text-amber-400" />;
    if (role === 'administrateur') return <Shield className="h-3 w-3 text-blue-400" />;
    return <UserIcon className="h-3 w-3 text-purple-300/50" />;
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'administrateur principale') return 'Admin Principal';
    if (role === 'administrateur') return 'Administrateur';
    return 'Utilisateur';
  };

  if (!isAuthenticated || !user) return null;

  const selectedUser = chatUsers.find(u => u.id === selectedUserId);

  // Floating button
  if (!isOpen) {
    return (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => { setIsOpen(true); loadUsers(); }}
          className="relative p-4 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center px-1 animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-[9999] w-[400px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)] flex flex-col rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-white/[0.1]"
      onClick={() => { setContextMenuId(null); setShowEmojis(false); }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {selectedUserId && (
            <button onClick={() => { setSelectedUserId(null); setMessages([]); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
          )}
          <div>
            <div className="text-white font-bold text-sm flex items-center gap-2">
              {selectedUser ? (
                <>
                  {selectedUser.firstName} {selectedUser.lastName}
                  {getRoleIcon(selectedUser.role)}
                </>
              ) : 'Messagerie Live'}
            </div>
            <div className="text-purple-200/70 text-xs">
              {selectedUser
                ? (selectedUser.live === 'true'
                  ? (typingUsers[selectedUser.id] ? 'En train d\'écrire...' : '🟢 En ligne')
                  : '🔴 Hors ligne')
                : `${chatUsers.length} utilisateur${chatUsers.length > 1 ? 's' : ''}`
              }
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* User list OR Messages */}
      {!selectedUserId ? (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
          {chatUsers.length === 0 ? (
            <div className="text-center text-purple-300/40 text-sm mt-16">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              Aucun utilisateur trouvé
            </div>
          ) : (
            chatUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => openConversation(u.id)}
                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] text-left"
              >
                {/* Avatar with online status */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-white/[0.08] flex items-center justify-center text-white font-bold text-sm">
                    {u.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    u.live === 'true' ? 'bg-emerald-400' : 'bg-red-500'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm truncate flex items-center gap-1.5">
                      {u.firstName} {u.lastName}
                      {getRoleIcon(u.role)}
                    </span>
                    {u.lastMessage && (
                      <span className="text-purple-300/30 text-[10px] shrink-0 ml-2">
                        {new Date(u.lastMessage.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-purple-300/40 text-xs truncate">
                      {u.lastMessage ? (
                        u.lastMessage.deleted
                          ? '🚫 Message supprimé'
                          : u.lastMessage.senderId === user?.id
                            ? `Vous : ${u.lastMessage.contenu}`
                            : u.lastMessage.contenu
                      ) : (
                        <span className="italic text-purple-300/20">{getRoleLabel(u.role)}</span>
                      )}
                    </span>
                    {u.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center px-1 shrink-0 ml-2 animate-pulse">
                        {u.unreadCount}
                      </span>
                    )}
                  </div>
                  {typingUsers[u.id] && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-emerald-400 text-[10px] ml-1">en train d'écrire...</span>
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            {messages.length === 0 && (
              <div className="text-center text-purple-300/40 text-sm mt-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                Envoyez votre premier message !
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} group relative`}
                >
                  <div className="relative max-w-[80%]">
                    {!isMine && (
                      <div className="text-[10px] text-fuchsia-400 font-semibold mb-1 ml-1 flex items-center gap-1">
                        {msg.senderNom} {getRoleIcon(msg.senderRole)}
                      </div>
                    )}

                    {msg.deleted ? (
                      <div className={`px-4 py-2.5 rounded-2xl text-sm italic ${
                        isMine
                          ? 'bg-white/[0.04] text-purple-300/40 rounded-br-md'
                          : 'bg-white/[0.04] text-purple-300/40 rounded-bl-md'
                      }`}>
                        🚫 Ce message a été supprimé
                        <div className="text-[10px] mt-1 text-purple-300/20">
                          {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : editingId === msg.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(msg.id); if (e.key === 'Escape') { setEditingId(null); setEditText(''); } }}
                          className="h-9 text-sm bg-white/[0.08] border-purple-400/30 text-white rounded-lg"
                          autoFocus
                        />
                        <button onClick={() => handleEdit(msg.id)} className="p-1.5 text-emerald-400 hover:bg-white/10 rounded-lg"><Check className="h-4 w-4" /></button>
                        <button onClick={() => { setEditingId(null); setEditText(''); }} className="p-1.5 text-red-400 hover:bg-white/10 rounded-lg"><XCircle className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer ${
                            isMine
                              ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md'
                              : 'bg-white/[0.08] text-purple-100 border border-white/[0.06] rounded-bl-md'
                          }`}
                          onClick={(e) => { e.stopPropagation(); setContextMenuId(contextMenuId === msg.id ? null : msg.id); }}
                        >
                          {msg.contenu}
                          <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMine ? 'text-purple-200/50' : 'text-purple-300/30'}`}>
                            {new Date(msg.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {msg.edited && <span className="italic">(modifié)</span>}
                            {isMine && msg.lu && <span>✓✓</span>}
                          </div>
                        </div>

                        <AnimatePresence>
                          {contextMenuId === msg.id && isMine && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute z-50 right-0 top-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[140px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button onClick={() => { setEditingId(msg.id); setEditText(msg.contenu); setContextMenuId(null); }} className="w-full px-3 py-2 text-left text-xs text-purple-200 hover:bg-white/[0.06] flex items-center gap-2">
                                <Pencil className="h-3.5 w-3.5 text-blue-400" /> Modifier
                              </button>
                              <button onClick={() => handleDelete(msg.id)} className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-white/[0.06] flex items-center gap-2">
                                <Trash2 className="h-3.5 w-3.5" /> Supprimer
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}

            <AnimatePresence>
              {selectedUserId && typingUsers[selectedUserId] && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
                  <div className="bg-white/[0.08] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker */}
          <AnimatePresence>
            {showEmojis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-slate-800/95 backdrop-blur border-t border-white/[0.06] px-3 py-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { setInput(prev => prev + emoji); setShowEmojis(false); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="p-3 bg-slate-900/90 backdrop-blur border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
              >
                <Smile className="h-5 w-5 text-purple-300/60" />
              </button>
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Écrire un message..."
                className="flex-1 h-11 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-purple-300/30 rounded-xl focus:bg-white/[0.08] focus:border-purple-400/30"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="h-11 w-11 p-0 bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl shadow-lg border border-white/10"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LiveChatAdmin;
