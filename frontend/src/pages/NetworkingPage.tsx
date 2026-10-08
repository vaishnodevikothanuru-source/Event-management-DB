import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, UserPlus, Check, MessageSquare, 
  Send, X, Bot, ShieldCheck, Briefcase, Tag 
} from 'lucide-react';
import { networkingApi } from '../services/api';
import { NetworkingConnection } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const NetworkingPage: React.FC = () => {
  const [connections, setConnections] = useState<NetworkingConnection[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<NetworkingConnection | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'them', text: 'Hey Elena! Saw you are attending the Autonomous Agents Keynote today. Are you experimenting with RAG in robotics?', time: '10:14 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const { awardPoints } = useAuth();

  useEffect(() => {
    const fetchNetworking = async () => {
      const conns = await networkingApi.getConnections();
      setConnections(conns);
    };
    fetchNetworking();
  }, []);

  const handleConnect = async (connId: string) => {
    const updated = await networkingApi.sendRequest(connId);
    setConnections(updated);
    awardPoints(75, 'Networking Connection Request');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      { sender: 'me', text: chatInput, time: 'Just now' }
    ]);
    setChatInput('');
    awardPoints(15, 'Direct Message Sent');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
            <Sparkles className="w-4 h-4" />
            <span>AI Matchmaking Engine</span>
          </div>
          <h1 className="text-3xl font-black text-white">Attendee Networking & 1-on-1 Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect with researchers, founders, and engineers ranked by multi-dimensional semantic profile similarity.
          </p>
        </div>
      </div>

      {/* Networking Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {connections.map((conn) => {
          const u = conn.user;
          return (
            <div 
              key={conn.id}
              className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-5 hover:border-brand-500/40 transition-all"
            >
              <div className="space-y-4">
                
                {/* Avatar & Match Score */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img 
                      src={u.avatarUrl} 
                      alt={u.firstName} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40 shadow-lg"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0B0F19]" />
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black border border-brand-500/30">
                      <Sparkles className="w-3 h-3 text-brand-400" />
                      {conn.matchScore}% Match
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">AI Semantic Fit</span>
                  </div>
                </div>

                {/* User details */}
                <div>
                  <h3 className="text-base font-bold text-white">{u.firstName} {u.lastName}</h3>
                  <p className="text-xs text-brand-400 font-semibold">{u.jobTitle}</p>
                  <p className="text-xs text-slate-400">{u.company}</p>
                </div>

                {/* Common Interests */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Shared Focus
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {conn.commonInterests.map((interest, i) => (
                      <span key={i} className="text-[10px] bg-slate-800/80 text-purple-300 px-2 py-0.5 rounded-md border border-slate-700/80">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Core Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {u.skills?.map((skill, i) => (
                      <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => handleConnect(conn.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    conn.status === 'ACCEPTED'
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : conn.status === 'PENDING'
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30'
                  }`}
                >
                  {conn.status === 'ACCEPTED' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </>
                  ) : conn.status === 'PENDING' ? (
                    <span>Request Pending</span>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveChatUser(conn)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Direct Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Direct Messaging Drawer Modal */}
      {activeChatUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl glass-panel border border-slate-700 bg-[#0F172A] shadow-2xl overflow-hidden flex flex-col h-[500px]">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <img 
                  src={activeChatUser.user.avatarUrl} 
                  alt="" 
                  className="w-9 h-9 rounded-xl object-cover border border-brand-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {activeChatUser.user.firstName} {activeChatUser.user.lastName}
                  </h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online in Networking Lounge
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveChatUser(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    msg.sender === 'me' 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
