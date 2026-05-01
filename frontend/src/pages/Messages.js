import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newConvoUserId, setNewConvoUserId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  const currentUserId = user?._id || user?.id;

  const fetchConversations = useCallback(async () => {
    try {
      const exRes = await api.get('/exchanges');
      const userIds = new Set();
      exRes.data.data.forEach((ex) => {
        const offerId = ex.offerUserId?._id || ex.offerUserId;
        const recId = ex.recipientUserId?._id || ex.recipientUserId;
        if (offerId && offerId !== currentUserId) userIds.add(JSON.stringify({ id: offerId, username: ex.offerUserId?.username || offerId }));
        if (recId && recId !== currentUserId) userIds.add(JSON.stringify({ id: recId, username: ex.recipientUserId?.username || recId }));
      });
      setConversations([...userIds].map((s) => JSON.parse(s)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [currentUserId]);

  const fetchMessages = useCallback(async (userId) => {
    if (!userId) return;
    try { const res = await api.get(`/messages/${userId}`); setMessages(res.data.data); }
    catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      pollingRef.current = setInterval(() => fetchMessages(selectedUserId), 10000);
    }
    return () => { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } };
  }, [selectedUserId, fetchMessages]);

  useEffect(() => {
    return () => { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } };
  }, []);

  const selectConversation = (userId, username) => {
    setSelectedUserId(userId); setSelectedUsername(username);
    setMessages([]); fetchMessages(userId);
  };

  const handleSend = async () => {
    const targetId = selectedUserId || newConvoUserId;
    if (!targetId || !newMessage.trim()) return;
    try {
      const res = await api.post('/messages', { recipientUserId: targetId, message: newMessage.trim() });
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
      if (!selectedUserId && newConvoUserId) {
        setSelectedUserId(newConvoUserId); setSelectedUsername(newConvoUserId);
        setNewConvoUserId(''); fetchConversations();
      }
    } catch (err) { setError(err.response?.data?.error || 'Failed to send message'); }
  };

  return (
    <div className="page-container">
      <h1 className="page-heading mb-6">Messages</h1>
      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="flex gap-4 h-[600px]">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><div className="spinner h-8 w-8"></div></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-sm">
                <p>No conversations yet.</p>
                <p className="mt-1">Complete an exchange to start chatting!</p>
              </div>
            ) : (
              conversations.map(({ id, username }) => (
                <button
                  key={id}
                  onClick={() => selectConversation(id, username)}
                  className={`w-full text-left px-4 py-3 transition-colors border-b border-slate-50 dark:border-slate-700/50 hover:bg-primary-50 dark:hover:bg-slate-700/50 ${
                    selectedUserId === id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-l-primary-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs flex-shrink-0">
                      {username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm truncate">{username}</span>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-slate-100 dark:border-slate-700">
            <input
              type="text"
              placeholder="New convo (user ID)"
              value={newConvoUserId}
              onChange={(e) => setNewConvoUserId(e.target.value)}
              className="form-input text-xs py-1.5"
            />
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex-1 card flex flex-col overflow-hidden min-w-0">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs">
                    {selectedUsername?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{selectedUsername}</h2>
                </div>
                <button onClick={() => fetchMessages(selectedUserId)} aria-label="Refresh messages"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium transition-colors">
                  ↻ Refresh
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
                    No messages yet. Say hi! 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = (msg.senderUserId?._id || msg.senderUserId) === currentUserId;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          isMine
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                        }`}>
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-slate-400 dark:text-slate-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMine && <span className="ml-1">{msg.isRead ? ' ✓✓' : ' ✓'}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="flex-1 form-input rounded-full"
                    placeholder="Type a message…"
                    aria-label="Message input"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="btn-primary rounded-full px-5"
                    aria-label="Send message"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="text-center">
                <div className="text-6xl mb-4" aria-hidden="true">💬</div>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Select a conversation</p>
                <p className="text-sm mt-1">or enter a user ID on the left to start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

