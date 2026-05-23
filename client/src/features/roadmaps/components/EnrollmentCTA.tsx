import React from 'react';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnrollmentCTAProps {
  title: string;
  description?: string;
  isEnrolling: boolean;
  onEnroll: () => void;
  difficulty: string;
  estimatedWeeks?: number;
}

export const EnrollmentCTA: React.FC<EnrollmentCTAProps> = ({
  title,
  description,
  isEnrolling,
  onEnroll,
  difficulty,
  estimatedWeeks = 8,
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-500/20 relative overflow-hidden select-none">
      {/* Visual background sparkles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

      <div className="relative z-10 max-w-3xl space-y-md">
        <div className="flex items-center gap-xs">
          <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Featured Study Map</span>
        </div>

        <div className="space-y-sm">
          <h2 className="text-heading-md font-black tracking-tight leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-indigo-100 text-body-xs leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-xs pt-xs text-body-xs font-bold">
          <div className="px-sm py-xxs bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 uppercase tracking-wider text-[10px]">
            Difficulty: {difficulty}
          </div>
          <div className="px-sm py-xxs bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 uppercase tracking-wider text-[10px]">
            Duration: {estimatedWeeks} Weeks
          </div>
          <div className="px-sm py-xxs bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 uppercase tracking-wider text-[10px]">
            Self-Paced Progression
          </div>
        </div>

        {/* Enroll CTA Action Button */}
        <div className="pt-md select-none">
          <Button
            size="lg"
            onClick={onEnroll}
            disabled={isEnrolling}
            className="h-12 px-8 bg-white hover:bg-slate-50 text-indigo-700 font-black rounded-2xl shadow-md uppercase tracking-wider text-body-xs border border-white hover:border-slate-100 transition duration-300 transform hover:scale-[1.02] cursor-pointer flex items-center gap-sm shrink-0"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Enrolling...</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4.5 w-4.5" />
                <span>Enroll & Begin Learning</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
