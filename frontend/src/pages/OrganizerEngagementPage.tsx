import React, { useState } from 'react';
import { 
  MessageSquare, BarChart3, PlusCircle, Sparkles, 
  Trash2, Check, ArrowRight, ToggleLeft, ToggleRight, 
  Eye, HelpCircle, Award 
} from 'lucide-react';
import { INITIAL_POLLS, INITIAL_QUESTIONS } from '../services/mockData';
import { Poll, Question } from '../types';

export const OrganizerEngagementPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>(INITIAL_POLLS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['Option 1', 'Option 2', 'Option 3']);

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollQuestion.trim()) return;

    const newPoll: Poll = {
      id: 'p_' + Date.now(),
      eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      question: newPollQuestion,
      isActive: true,
      options: newPollOptions.filter(o => o.trim()).map((opt, i) => ({
        id: 'opt_' + Date.now() + '_' + i,
        pollId: 'p_' + Date.now(),
        optionText: opt,
        voteCount: 0
      }))
    };

    setPolls([newPoll, ...polls]);
    setNewPollQuestion('');
    alert('Poll created and broadcasted to live audience via Kafka WebSocket stream!');
  };

  const toggleAnswered = (id: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, isAnswered: !q.isAnswered } : q));
  };

  const toggleHighlight = (id: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, isHighlighted: !q.isHighlighted } : q));
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
          <MessageSquare className="w-4 h-4" />
          <span>Real-time Interaction Control</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">
          Live Stage Engagement & Q&A Moderation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Launch interactive live polls, highlight top audience questions onto the keynote stage monitor, and run audience quizzes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Poll Creator & Active Polls */}
        <div className="space-y-6">
          
          {/* Create Poll Card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-400" />
              Create Live Audience Poll
            </h3>

            <form onSubmit={handleCreatePoll} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Poll Question</label>
                <input 
                  type="text"
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  placeholder="e.g. Which LLM provider does your enterprise use?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Poll Choices</label>
                {newPollOptions.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const copy = [...newPollOptions];
                      copy[i] = e.target.value;
                      setNewPollOptions(copy);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
              >
                Launch & Broadcast Poll
              </button>
            </form>
          </div>

          {/* Active Polls List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Active Stage Polls</h3>
            {polls.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-white">{p.question}</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Active
                  </span>
                </div>
                <div className="space-y-1.5">
                  {p.options.map((o) => (
                    <div key={o.id} className="flex justify-between text-xs text-slate-300">
                      <span>• {o.optionText}</span>
                      <span className="font-bold text-purple-400">{o.voteCount} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Col: Live Q&A Moderation Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Live Keynote Q&A Moderation Queue
            </h3>
            <span className="text-xs text-slate-400">{questions.length} questions submitted</span>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div 
                key={q.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  q.isHighlighted 
                    ? 'border-brand-500 bg-brand-950/30 ring-1 ring-brand-500/40' 
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white">{q.userName}</span>
                    <span className="text-[10px] text-slate-400 ml-2">({q.createdAt})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-cyan-400 text-xs font-bold">
                    ▲ {q.upvotes} Upvotes
                  </span>
                </div>

                <p className="text-xs text-slate-200">{q.questionText}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleHighlight(q.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all ${
                      q.isHighlighted 
                        ? 'bg-brand-600 text-white shadow-sm' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{q.isHighlighted ? 'Highlighted on Stage' : 'Highlight to Stage'}</span>
                  </button>

                  <button
                    onClick={() => toggleAnswered(q.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all ${
                      q.isAnswered 
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{q.isAnswered ? 'Marked Answered' : 'Mark Answered'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
