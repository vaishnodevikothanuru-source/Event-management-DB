import React, { useState } from 'react';
import { 
  MessageSquare, ThumbsUp, Send, CheckCircle2, 
  Sparkles, ShieldCheck, User as UserIcon, Filter
} from 'lucide-react';
import { Question } from '../types';
import { engagementApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface LiveQnAWidgetProps {
  eventId: string;
  initialQuestions?: Question[];
}

export const LiveQnAWidget: React.FC<LiveQnAWidgetProps> = ({ eventId, initialQuestions = [] }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'TOP' | 'RECENT' | 'ANSWERED'>('TOP');
  const { user, awardPoints } = useAuth();

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || submitting || !user) return;
    setSubmitting(true);

    try {
      const created = await engagementApi.askQuestion(eventId, newQuestionText, user, isAnonymous);
      setQuestions([created, ...questions]);
      setNewQuestionText('');
      awardPoints(40, 'Question Submitted');
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (qId: string) => {
    try {
      const updated = await engagementApi.upvoteQuestion(qId);
      setQuestions(updated.filter(q => q.eventId === eventId));
      awardPoints(10, 'Question Upvoted');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuestions = [...questions].sort((a, b) => {
    if (filter === 'TOP') return b.upvotes - a.upvotes;
    if (filter === 'ANSWERED') return (b.isAnswered ? 1 : 0) - (a.isAnswered ? 1 : 0);
    return 0; // Recent
  });

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/70">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Audience Q&A</h3>
            <p className="text-[11px] text-slate-400">Ask the speakers and upvote key topics</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
          <button 
            onClick={() => setFilter('TOP')} 
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filter === 'TOP' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Top Upvoted
          </button>
          <button 
            onClick={() => setFilter('RECENT')} 
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filter === 'RECENT' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Most Recent
          </button>
          <button 
            onClick={() => setFilter('ANSWERED')} 
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${filter === 'ANSWERED' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Answered
          </button>
        </div>
      </div>

      {/* Ask Question Form */}
      <form onSubmit={handleAsk} className="mb-6 space-y-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/80">
        <textarea
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          placeholder="Ask a technical or strategic question to the speakers..."
          rows={2}
          className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-lg p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input 
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
            />
            <span>Ask anonymously</span>
          </label>

          <button
            type="submit"
            disabled={!newQuestionText.trim() || submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Question</span>
          </button>
        </div>
      </form>

      {/* Questions List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {filteredQuestions.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-500">No questions posted yet. Be the first to ask!</p>
        ) : (
          filteredQuestions.map((q) => (
            <div 
              key={q.id}
              className={`p-3.5 rounded-xl border transition-all ${
                q.isHighlighted 
                  ? 'border-brand-500/50 bg-brand-950/20' 
                  : q.isAnswered 
                    ? 'border-emerald-900/40 bg-emerald-950/10' 
                    : 'border-slate-800 bg-slate-800/30 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  
                  {/* Badges */}
                  <div className="flex items-center gap-2 text-[11px]">
                    <div className="flex items-center gap-1 font-semibold text-slate-300">
                      {q.isAnonymous ? (
                        <UserIcon className="w-3 h-3 text-slate-400" />
                      ) : (
                        q.userAvatar && (
                          <img src={q.userAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                        )
                      )}
                      <span>{q.userName}</span>
                    </div>

                    {q.isHighlighted && (
                      <span className="flex items-center gap-1 text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.2 rounded font-semibold border border-brand-500/30">
                        <Sparkles className="w-2.5 h-2.5" /> Stage Highlighted
                      </span>
                    )}

                    {q.isAnswered && (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Answered
                      </span>
                    )}

                    <span className="text-slate-500 text-[10px]">{q.createdAt}</span>
                  </div>

                  {/* Text */}
                  <p className="text-xs text-slate-100 leading-relaxed">
                    {q.questionText}
                  </p>
                </div>

                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvote(q.id)}
                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border transition-all ${
                    q.hasUpvoted 
                      ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${q.hasUpvoted ? 'fill-cyan-400' : ''}`} />
                  <span className="text-[11px] font-bold mt-0.5">{q.upvotes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
