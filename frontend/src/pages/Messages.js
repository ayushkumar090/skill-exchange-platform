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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const fetchMessages = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
      pollingRef.current = setInterval(() => fetchMessages(selectedUserId), 10000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [selectedUserId, fetchMessages]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  const selectConversation = (userId, username) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setMessages([]);
    fetchMessages(userId);
  };

  const handleSend = async () => {
    const targetId = selectedUserId || newConvoUserId;
    if (!targetId || !newMessage.trim()) return;
    try {
      const res = await api.post('/messages', { recipientUserId: targetId, message: newMessage.trim() });
      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage('');
      if (!selectedUserId && newConvoUserId) {
        const username = newConvoUserId;
        setSelectedUserId(newConvoUserId);
        setSelectedUsername(username);
        setNewConvoUserId('');
        fetchConversations();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleRefresh = () => {
    if (selectedUserId) fetchMessages(selectedUserId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

      <div className="flex gap-4 h-[600px]">
        <div className="w-72 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                <p>No conversations yet.</p>
                <p className="mt-1">Complete an exchange to start chatting!</p>
              </div>
            ) : (
              conversations.map(({ id, username }) => (
                <button
                  key={id}
                  onClick={() => selectConversation(id, username)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 ${selectedUserId === id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-gray-700 text-sm">{username}</span>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-100">
            <input
              type="text"
              placeholder="New conversation (user ID)"
              value={newConvoUserId}
              onChange={(e) => setNewConvoUserId(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700">{selectedUsername}</h2>
                <button onClick={handleRefresh} className="text-blue-600 hover:text-blue-700 text-sm font-medium">↻ Refresh</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No messages yet. Say hi!</div>
                ) : (
                  messages.map((msg) => {
                    const isMine = (msg.senderUserId?._id || msg.senderUserId) === currentUserId;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
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
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-lg font-medium">Select a conversation</p>
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
