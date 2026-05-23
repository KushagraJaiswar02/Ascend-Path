import React from 'react';
import { Flame, CheckCircle, Target } from 'lucide-react';

interface ProgressOverviewProps {
  progressPercentage: number;
  completedStepsCount: number;
  totalRequiredSteps: number;
  streakCount: number;
  lastActiveAt?: string;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  progressPercentage,
  completedStepsCount,
  totalRequiredSteps,
  streakCount,
  lastActiveAt,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden select-none border border-slate-800">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center relative z-10">
        {/* Progress Percentage Wheel */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative flex items-center justify-center">
            {/* SVG circular progress indicator */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - progressPercentage / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black tracking-tight">{progressPercentage}%</span>
              <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Progress</span>
            </div>
          </div>
        </div>

        {/* Milestone tracking stats */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-slate-800/40 backdrop-blur px-5 py-4 rounded-2xl border border-slate-800/60">
            <div className="p-3 bg-indigo-500/15 text-indigo-400 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Curriculum Completed</p>
              <h4 className="text-xl font-black text-white mt-xxs">
                {completedStepsCount} <span className="text-sm font-bold text-slate-400">/ {totalRequiredSteps} Steps</span>
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/40 backdrop-blur px-5 py-4 rounded-2xl border border-slate-800/60">
            <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status Signal</p>
              <h4 className="text-base font-black text-white mt-xxs">
                {progressPercentage === 100 ? '🎉 Certified Mastery' : '🚀 Actively Pursuing'}
              </h4>
            </div>
          </div>
        </div>

        {/* Gamified Streaks Panel */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full scale-125 animate-pulse" />
            <div className={`p-4 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-white relative z-10 ${streakCount > 0 ? 'animate-bounce' : ''}`}>
              <Flame className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black tracking-tight text-white">{streakCount} Day Streak</h3>
            <p className="text-xs text-slate-400 mt-xxs max-w-[200px] leading-relaxed">
              {streakCount > 0
                ? 'Keep completing steps daily to maintain your momentum!'
                : 'Complete a step today to ignite your progression streak!'}
            </p>
          </div>
          {lastActiveAt && (
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mt-3">
              Last Active: {new Date(lastActiveAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
