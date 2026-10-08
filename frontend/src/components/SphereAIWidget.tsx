import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, X, Bot, User as UserIcon, 
  ExternalLink, ChevronRight, Layers, FileText, 
  Maximize2, Minimize2, CheckCircle2, RotateCcw
} from 'lucide-react';
import { aiApi } from '../services/api';
import { AIMessage, EventItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface SphereAIWidgetProps {
  currentEvent?: EventItem;
}

export const SphereAIWidget: React.FC<SphereAIWidgetProps> = ({ currentEvent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm **Sphere AI**, your intelligent conference assistant. I have indexed the complete event schedule, speaker research, venue logistics, and pgvector document embeddings.\n\nHow can I help you experience the summit today?`,
      timestamp: 'Just now',
      sources: ['Event Sphere Vector Vault', 'Verified Event Schedule'],
      suggestedActions: [
        { label: 'Explore Agenda', action: '/agenda' },
        { label: 'AI Matchmaking', action: '/networking' }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const suggestedPrompts = [
    'Who is speaking at 3 PM?',
    'Recommend AI sessions for me',
    'Where is the event venue?',
    'Who are the sponsors & booths?',
    'Who should I network with?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: AIMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await aiApi.sendMessage(textToSend, currentEvent);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: 'I apologize, I encountered a temporary network delay reaching the vector search pipeline. Please try asking again.',
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.startsWith('/')) {
      navigate(action);
      setIsOpen(false);
    } else if (action.startsWith('#')) {
      const el = document.querySelector(action);
      el?.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 text-white font-semibold shadow-2xl shadow-brand-500/50 hover:shadow-brand-500/80 hover:scale-105 transition-all duration-300"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0B0F19]" />
          </div>
          <span className="text-sm font-bold tracking-wide">Ask Sphere AI</span>
        </button>
      )}

      {/* Interactive AI Chat Panel */}
      {isOpen && (
        <div 
          className={`fixed z-50 glass-panel border border-brand-500/30 rounded-2xl shadow-2xl bg-[#0F172A]/95 flex flex-col transition-all duration-300 ${
            isExpanded 
              ? 'inset-4 md:inset-10' 
              : 'bottom-6 right-6 w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/80 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-pink-600 flex items-center justify-center shadow-md shadow-brand-500/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Sphere AI Assistant</h3>
                  <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.2 rounded border border-brand-500/30 font-medium">
                    RAG v2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Context: {currentEvent ? currentEvent.title.slice(0, 28) + '...' : 'Global Event Sphere'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  msg.sender === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none' 
                    : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line leading-relaxed text-[13px]">
                    {msg.text}
                  </div>

                  {/* Sources citation badges */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                        <Layers className="w-3 h-3 text-brand-400" /> RAG Context:
                      </span>
                      {msg.sources.map((src, i) => (
                        <span key={i} className="text-[10px] bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Action Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act.action)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-colors"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
                <div className="w-6 h-6 rounded-full bg-brand-600/20 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3 h-3 text-brand-400 animate-spin" />
                </div>
                <span>Sphere AI is performing vector RAG retrieval & synthesizing response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 rounded-b-2xl">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about speakers, venue, agenda, recommendations..."
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white shadow-md shadow-brand-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
