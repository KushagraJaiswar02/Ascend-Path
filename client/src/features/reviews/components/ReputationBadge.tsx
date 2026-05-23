import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReputationBadgeProps {
  fameScore: number;
  averageRating: number;
  className?: string;
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  fameScore,
  averageRating,
  className = '',
}) => {
  // Enforce premium visual cues
  if (fameScore >= 70 && averageRating >= 4.5) {
    return (
      <Badge
        className={`bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 border border-amber-500/25 px-sm py-[3px] rounded-full flex items-center gap-xxs font-extrabold text-[10px] select-none uppercase tracking-wider ${className}`}
      >
        <CheckCircle2 className="h-3 w-3 fill-amber-500/10 shrink-0" />
        <span>Verified Expert</span>
      </Badge>
    );
  }

  if (fameScore >= 50) {
    return (
      <Badge
        className={`bg-indigo-600/10 hover:bg-indigo-600/15 text-indigo-600 border border-indigo-600/20 px-sm py-[3px] rounded-full flex items-center gap-xxs font-extrabold text-[10px] select-none uppercase tracking-wider ${className}`}
      >
        <Trophy className="h-3 w-3 shrink-0" />
        <span>Top Mentor</span>
      </Badge>
    );
  }

  if (fameScore >= 30) {
    return (
      <Badge
        className={`bg-teal-600/10 hover:bg-teal-600/15 text-teal-600 border border-teal-600/20 px-sm py-[3px] rounded-full flex items-center gap-xxs font-extrabold text-[10px] select-none uppercase tracking-wider ${className}`}
      >
        <Star className="h-3 w-3 fill-teal-600/10 shrink-0" />
        <span>Trusted Guide</span>
      </Badge>
    );
  }

  return (
    <Badge
      className={`bg-muted border border-border px-sm py-[3px] rounded-full flex items-center gap-xxs font-extrabold text-[10px] select-none uppercase tracking-wider text-muted-foreground ${className}`}
    >
      <Sparkles className="h-3 w-3 shrink-0" />
      <span>Rising Guide</span>
    </Badge>
  );
};
