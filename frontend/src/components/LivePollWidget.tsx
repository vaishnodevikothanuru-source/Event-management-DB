import React, { useState } from 'react';
import { BarChart3, CheckCircle2, Award, Users, RefreshCw } from 'lucide-react';
import { Poll } from '../types';
import { engagementApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface LivePollWidgetProps {
  poll: Poll;
  onPollUpdated?: (updatedPolls: Poll[]) => void;
}

export const LivePollWidget: React.FC<LivePollWidgetProps> = ({ poll, onPollUpdated }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.userVotedOptionId || null);
  const [hasVoted, setHasVoted] = useState<boolean>(!!poll.userVotedOptionId);
  const [voting, setVoting] = useState(false);
  const { awardPoints } = useAuth();

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.voteCount, 0);

  const handleVote = async (optId: string) => {
    if (hasVoted || voting) return;
    setVoting(true);
    try {
      const updated = await engagementApi.votePoll(poll.id, optId);
      setSelectedOption(optId);
      setHasVoted(true);
      awardPoints(50, 'Live Poll Participation');
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
      if (onPollUpdated) onPollUpdated(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/70 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-pink-500 to-cyan-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Stage Poll</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold">Active</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {totalVotes} votes
          </span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-base font-bold text-white mb-4 leading-snug">
        {poll.question}
      </h3>

      {/* Options */}
      <div className="space-y-2.5">
        {poll.options.map((opt) => {
          const percentage = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
          const isSelected = selectedOption === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted || voting}
              className={`w-full relative overflow-hidden rounded-xl p-3 text-left transition-all border ${
                isSelected 
                  ? 'border-brand-500 bg-brand-950/40 shadow-md shadow-brand-500/20' 
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              {/* Animated Progress Bar Fill */}
              {hasVoted && (
                <div 
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-700 ease-out opacity-20 ${
                    isSelected ? 'bg-brand-500' : 'bg-slate-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected 
                      ? 'border-brand-400 bg-brand-500 text-white' 
                      : 'border-slate-600'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-brand-300' : 'text-slate-200'}`}>
                    {opt.optionText}
                  </span>
                </div>

                {hasVoted && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{percentage}%</span>
                    <span className="text-[10px] text-slate-400">({opt.voteCount})</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Points reward banner */}
      {hasVoted ? (
        <div className="mt-4 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Vote recorded! +50 XP awarded to your profile.</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-semibold">Live Synced</span>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-slate-400 text-center">
          Tap any option to cast your vote and earn engagement XP!
        </p>
      )}
    </div>
  );
};
