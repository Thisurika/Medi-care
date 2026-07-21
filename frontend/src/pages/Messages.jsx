import { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send } from 'lucide-react';

const AVATAR_COLORS = ['#2563eb','#06b6d4','#8b5cf6','#10b981','#f59e0b'];
const getColor = n => AVATAR_COLORS[(n?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = n => (n || '').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);   // unique contacts
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Load conversation threads list
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      const convs = data.conversations || [];
      setThreads(convs.map(c => c.partner));
    } catch {}
    finally { setLoading(false); }
  };

  // Load contacts (all users except me) for new message
  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/users');
      setContacts((data.users || data.data || []).filter(u => u._id !== user?._id));
    } catch {}
  };

  // Load thread messages with selected user
  const fetchThreadMessages = async (otherId) => {
    try {
      const { data } = await api.get(`/messages/conversation/${otherId}`);
      setMessages(data.messages || []);
    } catch {}
  };

  useEffect(() => { fetchConversations(); fetchContacts(); }, []);
  useEffect(() => { if (activeUser) fetchThreadMessages(activeUser._id); }, [activeUser]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const threadMessages = messages;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;
    setSending(true);
    try {
      await api.post('/messages', { receiver_id: activeUser._id, message: text });
      setText('');
      fetchThreadMessages(activeUser._id);
      fetchConversations();
    } catch {}
    finally { setSending(false); }
  };

  const handleSelectUser = (c) => {
    setActiveUser(c);
    setMessages([]);
  };

  const allContacts = [...new Map([...threads, ...contacts].map(u => [u._id, u])).values()];

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-breadcrumb">Inbox</div>
        <h1 className="page-title">Messages</h1>
      </div>

      <div className="msg-thread-wrap">
        {/* Left: contacts list */}
        <div className="card msg-list-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Conversations
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
              allContacts.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>No contacts yet</div>
              ) : allContacts.map(c => (
                <div
                  key={c._id}
                  className={`msg-item${activeUser?._id === c._id ? ' active' : ''}`}
                  onClick={() => handleSelectUser(c)}
                >
                  <div style={{ width:36, height:36, borderRadius:'50%', background:getColor(c.name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white', flexShrink:0 }}>
                    {getInitials(c.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="msg-item-name">{c.name}</div>
                    <div className="msg-item-preview">{c.role}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: chat */}
        <div className="card msg-chat-panel" style={{ padding: 0, overflow: 'hidden', display:'flex', flexDirection:'column' }}>
          {!activeUser ? (
            <div className="empty-state" style={{ display:'flex', flex:1, flexDirection:'column', justifyContent:'center' }}>
              <div className="empty-icon">💬</div>
              Select a contact to start messaging
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:getColor(activeUser.name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>
                  {getInitials(activeUser.name)}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{activeUser.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)' }}>{activeUser.role}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {threadMessages.length === 0 ? (
                  <div className="empty-state">No messages yet. Say hello!</div>
                ) : threadMessages.map(m => (
                  <div key={m._id} className={`chat-bubble ${m.sender?._id === user?._id ? 'mine' : 'theirs'}`}>
                    {m.message}
                    <div style={{ fontSize:10, opacity:0.6, marginTop:4 }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="chat-input-row" style={{ padding:'12px 16px' }}>
                <input
                  className="form-control chat-input"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message…"
                  disabled={sending}
                />
                <button type="submit" className="btn btn-primary" style={{ padding:'8px 16px' }} disabled={sending || !text.trim()}>
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
