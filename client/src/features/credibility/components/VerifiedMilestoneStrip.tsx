import React from 'react';
import { GraduationCap, Zap, Trophy, Star, BookMarked } from 'lucide-react';
import type { VerifiedAchievement } from '../api/credibility.api';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  roadmap_completion: <GraduationCap className="h-4 w-4" />,
  workshop_participation: <BookMarked className="h-4 w-4" />,
  mentorship_milestone: <Star className="h-4 w-4" />,
  learning_streak: <Zap className="h-4 w-4" />,
  specialization: <Trophy className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  roadmap_completion: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
  workshop_participation: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
  mentorship_milestone: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  learning_streak: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
  specialization: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
};

interface VerifiedMilestoneStripProps {
  achievements: VerifiedAchievement[];
  maxVisible?: number;
}

export const VerifiedMilestoneStrip: React.FC<VerifiedMilestoneStripProps> = ({
  achievements,
  maxVisible = 6,
}) => {
  const visible = achievements.slice(0, maxVisible);
  const remaining = achievements.length - maxVisible;

  if (achievements.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {visible.map((a) => (
        <div
          key={a._id}
          title={`${a.title} — ${a.credentialId}`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider cursor-default transition-all hover:scale-105 ${CATEGORY_COLORS[a.category] || 'bg-muted border-border text-muted-foreground'}`}
        >
          {CATEGORY_ICONS[a.category]}
          <span className="max-w-[100px] truncate">{a.title}</span>
        </div>
      ))}
      {remaining > 0 && (
        <span className="text-[10px] font-bold text-muted-foreground px-2 py-1 bg-muted/50 border border-border/40 rounded-full">
          +{remaining} more
        </span>
      )}
    </div>
  );
};
